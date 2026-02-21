const { z } = require('zod');

const createExpenseSchema = z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    tripId: z.string().uuid('Invalid trip ID').optional(),
    category: z.enum(['FUEL', 'TOLL', 'OTHER']),
    liters: z.number().positive().optional(),
    cost: z.number().min(0, 'Cost must be non-negative'),
    date: z.string().optional(),
    notes: z.string().optional(),
});

module.exports = { createExpenseSchema };
