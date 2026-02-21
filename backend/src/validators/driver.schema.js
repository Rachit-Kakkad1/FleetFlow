const { z } = require('zod');

const createDriverSchema = z.object({
    name: z.string().min(1, 'Driver name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    licenseNumber: z.string().min(1, 'License number is required'),
    licenseExpiry: z.string().datetime({ message: 'Invalid datetime format' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')),
    licenseCategories: z.array(z.enum(['TRUCK', 'VAN', 'BIKE'])).min(1, 'At least one license category required'),
});

const updateDriverSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    licenseNumber: z.string().min(1).optional(),
    licenseExpiry: z.string().optional(),
    licenseCategories: z.array(z.enum(['TRUCK', 'VAN', 'BIKE'])).optional(),
    safetyScore: z.number().min(0).max(100).optional(),
});

const updateDriverStatusSchema = z.object({
    status: z.enum(['ON_DUTY', 'OFF_DUTY', 'SUSPENDED']),
});

module.exports = { createDriverSchema, updateDriverSchema, updateDriverStatusSchema };
