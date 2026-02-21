/**
 * Middleware factory: Restricts access to specified roles.
 * Usage: authorize('MANAGER', 'DISPATCHER')
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
};

module.exports = authorize;
