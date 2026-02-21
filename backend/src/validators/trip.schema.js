const { z } = require('zod');

const createTripSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    driverId: z.string().uuid('Invalid driver ID'),
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    cargoDescription: z.string().min(1, 'Cargo description is required'),
    cargoWeightKg: z.number().positive('Cargo weight must be positive'),
    startOdometerKm: z.number().min(0).optional().default(0),
    revenue: z.number().min(0).optional(),
});

const completeTripSchema = z.object({
    endOdometerKm: z.number().min(0, 'End odometer reading is required'),
});

module.exports = { createTripSchema, completeTripSchema };
