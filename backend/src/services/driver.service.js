const prisma = require('../config/db');
const { getIo } = require('../socket');

/**
 * Trigger SOS alert
 */
const triggerSos = async (data) => {
    const alert = await prisma.sosAlert.create({
        data: {
            driverId: data.driverId,
            vehicleId: data.vehicleId,
            gpsLat: data.gpsLat,
            gpsLng: data.gpsLng
        }
    });

    try {
        getIo().emit('sos_alert', { vehicleId: data.vehicleId, alertId: alert.id });
    } catch (err) { }

    return alert;
};

const list = async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;

    return prisma.driver.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { trips: true } } },
    });
};

const listAvailable = async () => {
    return prisma.driver.findMany({
        where: {
            status: 'ON_DUTY',
            licenseExpiry: { gt: new Date() },
        },
        orderBy: { name: 'asc' },
    });
};

const getById = async (id) => {
    const driver = await prisma.driver.findUnique({
        where: { id },
        include: {
            trips: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
    });
    if (!driver) {
        const error = new Error('Driver not found.');
        error.statusCode = 404;
        throw error;
    }

    // Compute completion rate
    const completionRate = driver.totalTrips > 0
        ? ((driver.completedTrips / driver.totalTrips) * 100).toFixed(1)
        : '0.0';

    return { ...driver, completionRate: parseFloat(completionRate) };
};

const create = async (data) => {
    // Parse licenseExpiry to Date if it's a string
    if (typeof data.licenseExpiry === 'string') {
        data.licenseExpiry = new Date(data.licenseExpiry);
    }
    return prisma.driver.create({ data });
};

const update = async (id, data) => {
    if (data.licenseExpiry && typeof data.licenseExpiry === 'string') {
        data.licenseExpiry = new Date(data.licenseExpiry);
    }
    return prisma.driver.update({ where: { id }, data });
};

const updateStatus = async (id, status) => {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
        const error = new Error('Driver not found.');
        error.statusCode = 404;
        throw error;
    }

    // Cannot change status if driver is ON_TRIP
    if (driver.status === 'ON_TRIP') {
        const error = new Error('Cannot change status while driver is on a trip.');
        error.statusCode = 400;
        throw error;
    }

    return prisma.driver.update({ where: { id }, data: { status } });
};

const remove = async (id) => {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
        const error = new Error('Driver not found.');
        error.statusCode = 404;
        throw error;
    }
    if (driver.status === 'ON_TRIP') {
        const error = new Error('Cannot delete a driver who is on a trip.');
        error.statusCode = 400;
        throw error;
    }
    await prisma.driver.delete({ where: { id } });
    return { success: true };
};

module.exports = { list, listAvailable, getById, create, update, updateStatus, remove, triggerSos };
