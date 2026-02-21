const { z } = require('zod');

const createVehicleSchema = z.object({
    name: z.string().min(1, 'Vehicle name is required'),
    model: z.string().min(1, 'Model is required'),
    licensePlate: z.string().min(1, 'License plate is required'),
    type: z.enum(['TRUCK', 'VAN', 'BIKE']),
    maxCapacityKg: z.number().positive('Max capacity must be positive'),
    odometerKm: z.number().min(0).optional().default(0),
    region: z.string().optional(),
    acquisitionCost: z.number().min(0).optional().default(0),
});

const updateVehicleSchema = z.object({
    name: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    licensePlate: z.string().min(1).optional(),
    type: z.enum(['TRUCK', 'VAN', 'BIKE']).optional(),
    maxCapacityKg: z.number().positive().optional(),
    odometerKm: z.number().min(0).optional(),
    region: z.string().optional(),
    acquisitionCost: z.number().min(0).optional(),
});

module.exports = { createVehicleSchema, updateVehicleSchema };
