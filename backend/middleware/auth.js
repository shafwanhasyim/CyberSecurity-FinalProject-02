// middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' }); 
        }
        // Menyimpan payload token ke req.user (req.user.id, req.user.is_admin)
        req.user = user; 
        next();
    });
};

const requireAdmin = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ error: 'Administrator privileges required' });
        }

        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);
        const isAdmin = result.rows[0]?.is_admin;

        if (!isAdmin) {
            return res.status(403).json({ error: 'Administrator privileges required' });
        }

        next();
    } catch (err) {
        console.error('Admin check failed:', err);
        res.status(500).json({ error: 'Failed to verify administrator access' });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin
};
