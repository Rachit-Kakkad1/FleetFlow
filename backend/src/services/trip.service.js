const prisma = require('../config/db');

/**
 * List trips with optional filters.
 */
const list = async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.driverId) where.driverId = filters.driverId;

    return prisma.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            vehicle: { select: { id: true, name: true, licensePlate: true, type: true } },
            driver: { select: { id: true, name: true } },
        },
    });
};

/**
 * List pending (DRAFT) trips.
 */
const listPending = async () => {
    return prisma.trip.findMany({
        where: { status: 'DRAFT' },
        orderBy: { createdAt: 'desc' },
        include: {
            vehicle: { select: { id: true, code: true, name: true, type: true } },
            driver: { select: { id: true, code: true, name: true } },
        },
    });
};

/**
 * Get trip by ID with full relations.
 */
const getById = async (id) => {
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
            vehicle: true,
            driver: true,
            expenses: true,
        },
    });
    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }
    return trip;
};

/**
 * Create a trip as DRAFT.
 * Does NOT change vehicle/driver status — that happens on dispatch.
 */
const create = async (data) => {
    // 1. Validate vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
        const error = new Error('Vehicle not found.');
        error.statusCode = 404;
        throw error;
    }

    // 2. Validate driver exists
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) {
        const error = new Error('Driver not found.');
        error.statusCode = 404;
        throw error;
    }

    // 3. Cargo weight ≤ max capacity
    if (data.cargoWeightKg > vehicle.maxCapacityKg) {
        const error = new Error(
            `Cargo weight (${data.cargoWeightKg}kg) exceeds vehicle max capacity (${vehicle.maxCapacityKg}kg).`
        );
        error.statusCode = 400;
        throw error;
    }

    // 4. Driver license not expired
    if (new Date(driver.licenseExpiry) < new Date()) {
        const error = new Error(`Driver "${driver.name}" license has expired (${driver.licenseExpiry.toISOString().slice(0, 10)}).`);
        error.statusCode = 400;
        throw error;
    }

    // 5. Driver license category matches vehicle type
    if (!driver.licenseCategories.includes(vehicle.type)) {
        const error = new Error(
            `Driver "${driver.name}" is not licensed for vehicle type "${vehicle.type}". Licensed for: ${driver.licenseCategories.join(', ')}`
        );
        error.statusCode = 400;
        throw error;
    }

    // Create as DRAFT — no state change yet
    return prisma.trip.create({
        data: {
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            origin: data.origin,
            destination: data.destination,
            cargoDescription: data.cargoDescription,
            cargoWeightKg: data.cargoWeightKg,
            startOdometerKm: data.startOdometerKm || vehicle.odometerKm,
            revenue: data.revenue,
            status: 'DRAFT',
        },
        include: {
            vehicle: { select: { name: true, licensePlate: true } },
            driver: { select: { name: true } },
        },
    });
};

/**
 * Dispatch a trip: DRAFT → DISPATCHED.
 * Locks vehicle and driver (ON_TRIP).
 */
const dispatch = async (id) => {
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
    });

    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }

    if (trip.status !== 'DRAFT') {
        const error = new Error(`Cannot dispatch a trip with status "${trip.status}". Must be DRAFT.`);
        error.statusCode = 400;
        throw error;
    }

    // Re-validate availability at dispatch time
    if (trip.vehicle.status !== 'AVAILABLE') {
        const error = new Error(`Vehicle "${trip.vehicle.name}" is not available (current: ${trip.vehicle.status}).`);
        error.statusCode = 400;
        throw error;
    }

    if (trip.driver.status !== 'ON_DUTY') {
        const error = new Error(`Driver "${trip.driver.name}" is not on duty (current: ${trip.driver.status}).`);
        error.statusCode = 400;
        throw error;
    }

    // Transactional: update trip + vehicle + driver
    return prisma.$transaction([
        prisma.trip.update({
            where: { id },
            data: { status: 'DISPATCHED', dispatchedAt: new Date() },
        }),
        prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'ON_TRIP' },
        }),
        prisma.driver.update({
            where: { id: trip.driverId },
            data: { status: 'ON_TRIP', totalTrips: { increment: 1 } },
        }),
    ]);
};

/**
 * Complete a trip: DISPATCHED → COMPLETED.
 * Releases vehicle and driver.
 */
const complete = async (id, endOdometerKm) => {
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }

    if (trip.status !== 'DISPATCHED') {
        const error = new Error(`Cannot complete a trip with status "${trip.status}". Must be DISPATCHED.`);
        error.statusCode = 400;
        throw error;
    }

    return prisma.$transaction([
        prisma.trip.update({
            where: { id },
            data: { status: 'COMPLETED', endOdometerKm, completedAt: new Date() },
        }),
        prisma.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: 'AVAILABLE', odometerKm: endOdometerKm },
        }),
        prisma.driver.update({
            where: { id: trip.driverId },
            data: { status: 'ON_DUTY', completedTrips: { increment: 1 } },
        }),
    ]);
};

/**
 * Cancel a trip: DRAFT|DISPATCHED → CANCELLED.
 * If dispatched, releases vehicle and driver.
 */
const cancel = async (id) => {
    const trip = await prisma.trip.findUnique({ where: { id } });

    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }

    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
        const error = new Error(`Cannot cancel a trip with status "${trip.status}".`);
        error.statusCode = 400;
        throw error;
    }

    const operations = [
        prisma.trip.update({ where: { id }, data: { status: 'CANCELLED' } }),
    ];

    // If dispatched, release vehicle and driver
    if (trip.status === 'DISPATCHED') {
        operations.push(
            prisma.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: 'AVAILABLE' },
            }),
            prisma.driver.update({
                where: { id: trip.driverId },
                data: { status: 'ON_DUTY' },
            })
        );
    }

    return prisma.$transaction(operations);
};

module.exports = { list, listPending, getById, create, dispatch, complete, cancel };
