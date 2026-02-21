const prisma = require('../config/db');

/**
 * Fuel Efficiency: km per liter for each vehicle.
 */
const getFuelEfficiency = async () => {
    const vehicles = await prisma.vehicle.findMany({
        where: { status: { not: 'RETIRED' } },
        select: {
            id: true,
            name: true,
            licensePlate: true,
            odometerKm: true,
        },
    });

    const results = [];
    for (const vehicle of vehicles) {
        const fuelExpenses = await prisma.expense.aggregate({
            where: { vehicleId: vehicle.id, category: 'FUEL' },
            _sum: { liters: true, cost: true },
        });

        const totalLiters = fuelExpenses._sum.liters || 0;
        const totalFuelCost = fuelExpenses._sum.cost || 0;
        const kmPerLiter = totalLiters > 0 ? (vehicle.odometerKm / totalLiters).toFixed(2) : null;

        results.push({
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            licensePlate: vehicle.licensePlate,
            totalKm: vehicle.odometerKm,
            totalLiters,
            totalFuelCost,
            kmPerLiter: kmPerLiter ? parseFloat(kmPerLiter) : null,
        });
    }

    return results;
};

/**
 * Cost per KM: Total Operational Cost ÷ Total KM driven per vehicle.
 */
const getCostPerKm = async () => {
    const vehicles = await prisma.vehicle.findMany({
        where: { status: { not: 'RETIRED' } },
        select: { id: true, name: true, licensePlate: true, odometerKm: true },
    });

    const results = [];
    for (const vehicle of vehicles) {
        const [expenseAgg, maintenanceAgg] = await Promise.all([
            prisma.expense.aggregate({ where: { vehicleId: vehicle.id }, _sum: { cost: true } }),
            prisma.maintenanceLog.aggregate({ where: { vehicleId: vehicle.id }, _sum: { cost: true } }),
        ]);

        const totalCost = (expenseAgg._sum.cost || 0) + (maintenanceAgg._sum.cost || 0);
        const costPerKm = vehicle.odometerKm > 0 ? (totalCost / vehicle.odometerKm).toFixed(2) : null;

        results.push({
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            licensePlate: vehicle.licensePlate,
            totalKm: vehicle.odometerKm,
            totalOperationalCost: totalCost,
            costPerKm: costPerKm ? parseFloat(costPerKm) : null,
        });
    }

    return results;
};

/**
 * Vehicle ROI: (Revenue - (Maintenance + Fuel)) / AcquisitionCost × 100
 */
const getVehicleROI = async () => {
    const vehicles = await prisma.vehicle.findMany({
        select: {
            id: true,
            name: true,
            licensePlate: true,
            acquisitionCost: true,
        },
    });

    const results = [];
    for (const vehicle of vehicles) {
        const [tripRevenue, expenseAgg, maintenanceAgg] = await Promise.all([
            prisma.trip.aggregate({
                where: { vehicleId: vehicle.id, status: 'COMPLETED' },
                _sum: { revenue: true },
            }),
            prisma.expense.aggregate({ where: { vehicleId: vehicle.id }, _sum: { cost: true } }),
            prisma.maintenanceLog.aggregate({ where: { vehicleId: vehicle.id }, _sum: { cost: true } }),
        ]);

        const revenue = tripRevenue._sum.revenue || 0;
        const totalCosts = (expenseAgg._sum.cost || 0) + (maintenanceAgg._sum.cost || 0);
        const profit = revenue - totalCosts;
        const roi = vehicle.acquisitionCost > 0
            ? ((profit / vehicle.acquisitionCost) * 100).toFixed(2)
            : null;

        results.push({
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            licensePlate: vehicle.licensePlate,
            totalRevenue: revenue,
            totalCosts,
            profit,
            acquisitionCost: vehicle.acquisitionCost,
            roiPercent: roi ? parseFloat(roi) : null,
        });
    }

    return results;
};

/**
 * Export data as CSV string.
 */
const exportCSV = async (type) => {
    let data;
    let headers;

    switch (type) {
        case 'fuel-efficiency':
            data = await getFuelEfficiency();
            headers = ['Vehicle', 'License Plate', 'Total KM', 'Total Liters', 'Fuel Cost', 'KM/L'];
            return formatCSV(headers, data.map(d => [d.vehicleName, d.licensePlate, d.totalKm, d.totalLiters, d.totalFuelCost, d.kmPerLiter]));

        case 'cost-per-km':
            data = await getCostPerKm();
            headers = ['Vehicle', 'License Plate', 'Total KM', 'Total Cost', 'Cost/KM'];
            return formatCSV(headers, data.map(d => [d.vehicleName, d.licensePlate, d.totalKm, d.totalOperationalCost, d.costPerKm]));

        case 'vehicle-roi':
            data = await getVehicleROI();
            headers = ['Vehicle', 'License Plate', 'Revenue', 'Costs', 'Profit', 'Acquisition Cost', 'ROI %'];
            return formatCSV(headers, data.map(d => [d.vehicleName, d.licensePlate, d.totalRevenue, d.totalCosts, d.profit, d.acquisitionCost, d.roiPercent]));

        case 'trips':
            data = await prisma.trip.findMany({
                include: {
                    vehicle: { select: { name: true, licensePlate: true } },
                    driver: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            headers = ['Trip ID', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Cargo (kg)', 'Status', 'Created'];
            return formatCSV(headers, data.map(d => [d.id, d.vehicle.name, d.driver.name, d.origin, d.destination, d.cargoWeightKg, d.status, d.createdAt.toISOString().slice(0, 10)]));

        default:
            const error = new Error(`Unknown report type: ${type}. Supported: fuel-efficiency, cost-per-km, vehicle-roi, trips`);
            error.statusCode = 400;
            throw error;
    }
};

function formatCSV(headers, rows) {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','));
    return [headerLine, ...dataLines].join('\n');
}

module.exports = { getFuelEfficiency, getCostPerKm, getVehicleROI, exportCSV };
