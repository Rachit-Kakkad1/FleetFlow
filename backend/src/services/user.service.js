const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const createUser = async (data, creatorId) => {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: data.role,
            createdBy: creatorId,
            isActive: true,
            mustResetPassword: true,
        },
        select: { id: true, email: true, name: true, role: true, createdBy: true, isActive: true, createdAt: true },
    });
};

const listUsers = async () => {
    return prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdBy: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
};

const deleteUser = async (id) => {
    return prisma.user.delete({
        where: { id },
    });
};

module.exports = { createUser, listUsers, deleteUser };
