const prisma = require('../config/db');

const list = async (filters = {}) => {
    const where = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;

    return prisma.maintenanceLog.findMany({
        where,
        orderBy: { startDate: 'desc' },
        include: {
            vehicle: { select: { id: true, name: true, licensePlate: true } },
        },
    });
};

const listByVehicle = async (vehicleId) => {
    return prisma.maintenanceLog.findMany({
        where: { vehicleId },
        orderBy: { startDate: 'desc' },
        include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    });
};

/**
 * Create maintenance log.
 * AUTO-LOGIC: Sets vehicle status to IN_SHOP.
 */
const create = async (data) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }

    if (vehicle.status === 'ON_TRIP') {
        const error = new Error('Cannot send a vehicle to maintenance while it is on a trip.');
        error.statusCode = 400;
        throw error;
    }

    // Transactional: create log + set vehicle IN_SHOP
    const [log] = await prisma.$transaction([
        prisma.maintenanceLog.create({
            data: {
                vehicleId: data.vehicleId,
                type: data.type,
                description: data.description,
                cost: data.cost,
                startDate: data.startDate ? new Date(data.startDate) : new Date(),
            },
        }),
        prisma.vehicle.update({
            where: { id: data.vehicleId },
            data: { status: 'IN_SHOP' },
        }),
    ]);

    return log;
};

/**
 * Complete maintenance.
 * AUTO-LOGIC: Sets vehicle status back to AVAILABLE.
 */
const complete = async (id) => {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
        const error = new Error('Maintenance log not found.');
        error.statusCode = 404;
        throw error;
    }

    if (log.endDate) {
        const error = new Error('Maintenance already completed.');
        error.statusCode = 400;
        throw error;
    }

    const [updatedLog] = await prisma.$transaction([
        prisma.maintenanceLog.update({
            where: { id },
            data: { endDate: new Date() },
        }),
        prisma.vehicle.update({
            where: { id: log.vehicleId },
            data: { status: 'AVAILABLE' },
        }),
    ]);

    return updatedLog;
};

module.exports = { list, listByVehicle, create, complete };
