const prisma = require('../config/db');
const io = require('../socket');

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
            deliveryProofs: true,
            signatures: true,
        },
    });
};

/**
 * List pending (DRAFT) trips.
 */
const listPending = async () => {
    return prisma.trip.findMany({
        where: { status: 'PENDING_SAFETY_APPROVAL' },
        orderBy: { createdAt: 'desc' },
        include: {
            vehicle: { select: { id: true, code: true, name: true, type: true, maxCapacityKg: true } },
            driver: { select: { id: true, code: true, name: true, licenseExpiry: true, safetyScore: true } },
        },
    });
};

/**
 * Get trips assigned to a specific driver email
 */
const getMyTrips = async (userEmail) => {
    const driver = await prisma.driver.findUnique({ where: { email: userEmail } });
    if (!driver) return [];

    return prisma.trip.findMany({
        where: { driverId: driver.id, status: { in: ['APPROVED', 'ON_TRIP'] } },
        orderBy: { createdAt: 'desc' },
        include: {
            vehicle: { select: { id: true, name: true, licensePlate: true, type: true } },
            driver: { select: { id: true, name: true } },
            deliveryProofs: true,
            signatures: true,
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
    const newTrip = await prisma.trip.create({
        data: {
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            origin: data.origin,
            destination: data.destination,
            cargoDescription: data.cargoDescription,
            cargoWeightKg: data.cargoWeightKg,
            startOdometerKm: data.startOdometerKm || vehicle.odometerKm,
            revenue: data.revenue,
            status: 'PENDING_SAFETY_APPROVAL',
        },
        include: {
            vehicle: { select: { name: true, licensePlate: true } },
            driver: { select: { name: true } },
        },
    });

    if (io.getIo()) {
        io.getIo().emit('trip_status_change', { tripId: newTrip.id, status: newTrip.status });
    }
    return newTrip;
};

/**
 * Approve a trip: PENDING_SAFETY_APPROVAL → APPROVED.
 */
const approve = async (id, safetyInspectionData) => {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }

    if (trip.status !== 'PENDING_SAFETY_APPROVAL') {
        const error = new Error(`Cannot approve a trip with status "${trip.status}". Must be PENDING_SAFETY_APPROVAL.`);
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.$transaction([
        prisma.trip.update({
            where: { id },
            data: { status: 'APPROVED' },
        }),
        prisma.safetyInspection.create({
            data: {
                tripId: id,
                driverId: trip.driverId,
                photoUrl: safetyInspectionData.photoUrl,
                status: 'APPROVED',
            }
        })
    ]);

    try { io.getIo().emit('trip_status_change', { tripId: id, status: 'APPROVED' }); } catch (err) { }
    return result;
};

/**
 * Decline a trip: PENDING_SAFETY_APPROVAL → DRAFT.
 */
const decline = async (id, declineReason, photoUrl) => {
    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
        const error = new Error('Trip not found.');
        error.statusCode = 404;
        throw error;
    }

    if (trip.status !== 'PENDING_SAFETY_APPROVAL') {
        const error = new Error(`Cannot decline a trip with status "${trip.status}". Must be PENDING_SAFETY_APPROVAL.`);
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.$transaction([
        prisma.trip.update({
            where: { id },
            data: { status: 'DRAFT' },
        }),
        prisma.safetyInspection.create({
            data: {
                tripId: id,
                driverId: trip.driverId,
                photoUrl: photoUrl || '',
                status: 'DECLINED',
                declinedReason: declineReason
            }
        })
    ]);

    try { io.getIo().emit('trip_status_change', { tripId: id, status: 'DRAFT' }); } catch (err) { }
    return result;
};

/**
 * Accept trip by driver: APPROVED → ON_TRIP.
 * Locks vehicle and driver.
 */
const acceptTrip = async (id) => {
    const trip = await prisma.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
    });

    if (!trip) {
        throw Object.assign(new Error('Trip not found.'), { statusCode: 404 });
    }

    if (trip.status !== 'APPROVED') {
        throw Object.assign(new Error(`Cannot accept a trip with status "${trip.status}". Must be APPROVED.`), { statusCode: 400 });
    }

    if (trip.vehicle.status !== 'AVAILABLE') {
        throw Object.assign(new Error(`Vehicle "${trip.vehicle.name}" is not available.`), { statusCode: 400 });
    }

    if (trip.driver.status !== 'ON_DUTY') {
        throw Object.assign(new Error(`Driver "${trip.driver.name}" is not on duty.`), { statusCode: 400 });
    }

    const result = await prisma.$transaction([
        prisma.trip.update({
            where: { id },
            data: { status: 'ON_TRIP', dispatchedAt: new Date() },
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
    try { io.getIo().emit('trip_status_change', { tripId: id, status: 'ON_TRIP' }); } catch (err) { }
    return result;
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

    if (trip.status !== 'ON_TRIP') {
        const error = new Error(`Cannot complete a trip with status "${trip.status}". Must be ON_TRIP.`);
        error.statusCode = 400;
        throw error;
    }

    const result = await prisma.$transaction([
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
    try { io.getIo().emit('trip_status_change', { tripId: id, status: 'COMPLETED' }); } catch (err) { }
    return result;
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
    if (trip.status === 'ON_TRIP') {
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

    const result = await prisma.$transaction(operations);
    try { io.getIo().emit('trip_status_change', { tripId: id, status: 'CANCELLED' }); } catch (err) { }
    return result;
};

/**
 * Upload delivery proof
 */
const uploadProof = async (id, data) => {
    const proof = await prisma.deliveryProof.create({
        data: {
            tripId: id,
            photoUrl: data.photoUrl,
            notes: data.notes
        }
    });
    try { io.getIo().emit('delivery_verification', { tripId: id, proofId: proof.id }); } catch (err) { }
    return proof;
};

/**
 * Upload signature
 */
const uploadSignature = async (id, data) => {
    return prisma.signature.create({
        data: {
            tripId: id,
            signatureUrl: data.signatureUrl
        }
    });
};

/**
 * Verify Delivery Proof
 */
const verifyDelivery = async (id) => {
    // Verifies all proofs for a trip
    return prisma.deliveryProof.updateMany({
        where: { tripId: id },
        data: { verified: true }
    });
};

/**
 * Reject Delivery Proof
 */
const rejectDelivery = async (id, reason) => {
    // Delete all unverified proofs and signatures so driver can re-submit
    const result = await prisma.$transaction([
        prisma.deliveryProof.deleteMany({ where: { tripId: id, verified: false } }),
        prisma.signature.deleteMany({ where: { tripId: id } })
    ]);
    return { success: true, message: 'Proof rejected, driver must resubmit.', reason };
};

module.exports = { list, listPending, getMyTrips, getById, create, approve, decline, acceptTrip, complete, cancel, uploadProof, uploadSignature, verifyDelivery, rejectDelivery };
