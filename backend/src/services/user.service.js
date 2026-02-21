const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const createUser = async (data) => {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: data.role,
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
};

const listUsers = async () => {
    return prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
};

module.exports = { createUser, listUsers };
