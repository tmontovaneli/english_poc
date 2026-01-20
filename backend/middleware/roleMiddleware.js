// Middleware to check if user has required role

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

const requireAdmin = requireRole('admin');
const requireTeacherOrAdmin = requireRole('teacher', 'admin');

module.exports = {
    requireRole,
    requireAdmin,
    requireTeacherOrAdmin
};
