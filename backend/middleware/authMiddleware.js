const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    // 1. Check for API Header (System Auth)
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        // Ensure API_CLIENT_KEYS is defined
        const validKeys = process.env.API_CLIENT_KEYS ? process.env.API_CLIENT_KEYS.split(',') : [];
        if (validKeys.includes(apiKey)) {
            // Valid system call
            req.user = { id: 'system', role: 'system' };
            console.log('Authenticated via API Key');
            return next();
        } else {
            return res.status(401).json({ message: 'Invalid API Key' });
        }
    }

    // 2. Check for Bearer Token (Human Auth)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (fetching fresh data from DB is safer)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                // User might have been deleted but token is still valid signature-wise
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token && !apiKey) {
        res.status(401).json({ message: 'Not authorized, no token or key' });
    }
};

module.exports = { protect };
