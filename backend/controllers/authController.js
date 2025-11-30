// controllers/authController.js
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); 

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 5; // Rendah, untuk speed/contoh

const register = async (req, res) => {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    try {
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name) 
             VALUES ($1, $2, $3, $4) RETURNING id, username, email`, 
            [username, email, password_hash, full_name || '']
        );

        res.status(201).json({ 
            message: 'User registered successfully. Please login.',
            user: newUser.rows[0]
        });

    } catch (err) {
        if (err.code === '23505') { // PostgreSQL error code for unique violation
            return res.status(409).json({ error: 'Username or email already exists.' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT id, username, password_hash, is_admin FROM users WHERE username = $1', 
            [username]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Token JWT (Sengaja Rentan: Tanpa Expires)
        const token = jwt.sign(
            { id: user.id, username: user.username, is_admin: user.is_admin },
            JWT_SECRET
        );

        res.json({ token, id: user.id });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

module.exports = {
    register,
    login
};
