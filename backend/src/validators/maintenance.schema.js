const { z } = require('zod');

const createMaintenanceSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    type: z.enum(['PREVENTIVE', 'REACTIVE']),
    description: z.string().min(1, 'Description is required'),
    cost: z.number().min(0, 'Cost must be non-negative'),
    startDate: z.string().optional(),
});

module.exports = { createMaintenanceSchema };
