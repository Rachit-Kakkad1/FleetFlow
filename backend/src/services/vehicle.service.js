const prisma = require('../config/db');

const list = async (filters = {}) => {
    const where = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.region) where.region = { contains: filters.region, mode: 'insensitive' };

    return prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { trips: true, maintenanceLogs: true } } },
    });
};

const listAvailable = async () => {
    return prisma.vehicle.findMany({
        where: { status: 'AVAILABLE' },
        orderBy: { name: 'asc' },
    });
};

const getById = async (id) => {
    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
            trips: { orderBy: { createdAt: 'desc' }, take: 10 },
            maintenanceLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
            expenses: { orderBy: { date: 'desc' }, take: 10 },
        },
    });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }
    return vehicle;
};

const create = async (data) => {
    return prisma.vehicle.create({ data });
};

const update = async (id, data) => {
    return prisma.vehicle.update({ where: { id }, data });
};

const updateStatus = async (id, status) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }
    return prisma.vehicle.update({ where: { id }, data: { status } });
};

const retire = async (id) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }

    // Toggle between RETIRED and AVAILABLE
    const newStatus = vehicle.status === 'RETIRED' ? 'AVAILABLE' : 'RETIRED';
    return prisma.vehicle.update({
        where: { id },
        data: { status: newStatus },
    });
};

const remove = async (id) => {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }
    if (vehicle.status === 'ON_TRIP') {
        const error = new Error('Cannot delete a vehicle that is on a trip.');
        error.statusCode = 400;
        throw error;
    }
    await prisma.vehicle.delete({ where: { id } });
    return { success: true };
};

module.exports = { list, listAvailable, getById, create, update, updateStatus, retire, remove };
