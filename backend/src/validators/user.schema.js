const { z } = require('zod');

const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'DRIVER', 'FINANCIAL_ANALYST']),
});

module.exports = { createUserSchema };
