const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

/**
 * Middleware: Verifies JWT from Authorization header and attaches user to req.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // Fetch fresh user data to ensure they still exist and role hasn't changed
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is valid but user no longer exists.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

module.exports = authenticate;
