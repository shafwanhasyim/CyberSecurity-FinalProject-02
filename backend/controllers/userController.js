// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 5; 

// --- VULNERABILITY 1: NO API AUTH / DATA LEAK ---
const getAllUsers = async (req, res) => {
    // ⚠️ Flaw 1: TIDAK ADA authenticateToken middleware. Akses anonim diizinkan.
    try {
        const result = await pool.query(
            // ⚠️ Mengambil password_hash dan semua data sensitif
            'SELECT id, username, email, full_name, is_admin, created_at, password_hash FROM users'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all users:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// --- VULNERABILITY 3 (BONUS): IDOR ON PROFILE VIEW ---
const getUserProfile = async (req, res) => {
    // Middleware authenticateToken sudah dijalankan. req.user adalah penyerang.
    const targetId = req.params.id; // ID yang ingin dilihat profilenya (Korban)

    // ⚠️ Flaw 3: TIDAK ADA pemeriksaan otorisasi: if (targetId !== req.user.id)
    // Penyerang dapat memasukkan ID korban di URL.

    try {
        const result = await pool.query(
            'SELECT id, username, email, full_name, is_admin, created_at FROM users WHERE id = $1',
            [targetId] 
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

// --- NORMAL (Self-Update) ---
const updateProfile = async (req, res) => {
    // Middleware authenticateToken sudah dijalankan.
    const userId = req.user.id; // ID pengguna dari token (Hanya boleh update diri sendiri)
    const { full_name, email } = req.body;

    try {
        const result = await pool.query(
            `UPDATE users SET full_name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 RETURNING id, username, email, full_name`,
            [full_name, email, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Database error' });
    }
};


// --- VULNERABILITY 2: BROKEN AUTHORIZATION / IDOR RESET PASSWORD ---
const resetPassword = async (req, res) => {
    // Middleware authenticateToken sudah dijalankan.
    const targetId = req.params.id;     // ID Korban (dari URL)
    const attackerId = req.user.id;     // ID Penyerang (dari Token)
    const { new_password } = req.body;

    if (!new_password) {
        return res.status(400).json({ error: 'New password is required' });
    }

    // ⚠️ Flaw 2: Logika Rentan: TIDAK ADA pemeriksaan otorisasi: if (targetId !== attackerId)
    // Penyerang dapat mengganti password Korban.

    try {
        const newHash = await bcrypt.hash(new_password, SALT_ROUNDS); 

        const updateResult = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newHash, targetId] 
        );

        if (updateResult.rowCount === 0) {
            // Ini bisa jadi ID target tidak ditemukan, atau user tidak punya hak akses (jika ada otorisasi)
            return res.status(404).json({ error: 'User not found or update failed.' });
        }

        res.json({ 
            message: `Password for user ID ${targetId} updated successfully.`,
            debug_info: `Request made by user ID: ${attackerId}`
        });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
};

module.exports = {
    getAllUsers,
    getUserProfile,
    updateProfile,
    resetPassword
};
