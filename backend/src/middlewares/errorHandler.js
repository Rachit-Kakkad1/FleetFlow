/**
 * Global error handler — catches all unhandled errors and returns structured JSON.
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('❌ Unhandled Error:', err);

    // Prisma known errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `A record with this ${field} already exists.`,
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found.',
        });
    }

    // Default
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error.',
    });
};

module.exports = errorHandler;
