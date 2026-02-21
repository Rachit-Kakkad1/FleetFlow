const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');

// Map internal enum → frontend display name
const ROLE_MAP = {
    MANAGER: 'Fleet Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    FINANCIAL_ANALYST: 'Financial Analyst',
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user);
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: ROLE_MAP[user.role] || user.role,
        },
    };
};

const getProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return null;
    return { ...user, role: ROLE_MAP[user.role] || user.role };
};

module.exports = { login, getProfile };
