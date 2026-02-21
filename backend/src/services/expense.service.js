const prisma = require('../config/db');
const { getIo } = require('../socket');

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

    const expense = await prisma.expense.create({
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

    // --- Fuel Anomaly Detection Logic ---
    if (data.category === 'FUEL' && data.liters && data.tripId) {
        const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
        if (trip) {
            let distanceTravelled = Math.max(0, vehicle.odometerKm - trip.startOdometerKm);
            if (distanceTravelled === 0) distanceTravelled = 100; // Fallback if odo wasn't updated

            const baselineMap = { TRUCK: 5, VAN: 10, BIKE: 40 };
            const baseline = baselineMap[vehicle.type] || 10;
            const expectedFuel = distanceTravelled / baseline;

            if (data.liters > expectedFuel * 1.15) {
                // Auto-create FuelAnomaly record
                const anomaly = await prisma.fuelAnomaly.create({
                    data: {
                        vehicleId: vehicle.id,
                        driverId: trip.driverId,
                        tripId: trip.id,
                        expectedFuel,
                        loggedFuel: data.liters,
                        difference: data.liters - expectedFuel,
                        status: 'PENDING_REVIEW'
                    }
                });

                try {
                    getIo().emit('fuel_anomaly', { vehicleId: vehicle.id, tripId: trip.id, anomalyId: anomaly.id });
                } catch (err) { }
            }
        }
    }

    return expense;
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

const getAnomalies = async () => {
    return prisma.fuelAnomaly.findMany({
        orderBy: { date: 'desc' },
        include: {
            vehicle: { select: { id: true, name: true, licensePlate: true } },
            trip: { select: { id: true, code: true } }
        }
    });
};

const resolveAnomaly = async (id) => {
    return prisma.fuelAnomaly.update({
        where: { id },
        data: { status: 'CLEARED' }
    });
};

module.exports = { list, create, getTotalCostByVehicle, getAnomalies, resolveAnomaly };
