const prisma = require('../config/db');

const list = async (filters = {}) => {
    const where = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.category) where.category = filters.category;
    if (filters.startDate && filters.endDate) {
        where.date = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
        };
    }

    return prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
            vehicle: { select: { id: true, name: true, licensePlate: true } },
            trip: { select: { id: true, origin: true, destination: true } },
        },
    });
};

const create = async (data) => {
    // Validate vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }

    return prisma.expense.create({
        data: {
            vehicleId: data.vehicleId,
            tripId: data.tripId || null,
            category: data.category,
            liters: data.liters || null,
            cost: data.cost,
            date: data.date ? new Date(data.date) : new Date(),
            notes: data.notes || null,
        },
    });
};

/**
 * Total operational cost for a vehicle: Fuel + Maintenance.
 */
const getTotalCostByVehicle = async (vehicleId) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }

    const expenseTotal = await prisma.expense.aggregate({
        where: { vehicleId },
        _sum: { cost: true },
    });

    const maintenanceTotal = await prisma.maintenanceLog.aggregate({
        where: { vehicleId },
        _sum: { cost: true },
    });

    const fuelCost = expenseTotal._sum.cost || 0;
    const maintenanceCost = maintenanceTotal._sum.cost || 0;

    return {
        vehicleId,
        vehicleName: vehicle.name,
        licensePlate: vehicle.licensePlate,
        fuelAndExpenses: fuelCost,
        maintenanceCost,
        totalOperationalCost: fuelCost + maintenanceCost,
    };
};

module.exports = { list, create, getTotalCostByVehicle };
