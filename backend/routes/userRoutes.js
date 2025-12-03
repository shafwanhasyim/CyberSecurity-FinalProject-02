// routes/userRoutes.js
const express = require('express');
const {
    getAllUsers,
    getUserProfile,
    updateProfile,
    resetPassword
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/all', authenticateToken, requireAdmin, getAllUsers);

// ⚠️ VULNERABILITY 3: IDOR on Profile View (Authenticated but not authorized check)
router.get('/:id', authenticateToken, getUserProfile); // Uses ID from URL (vulnerable)

// Normal (Self-Update)
router.put('/profile', authenticateToken, updateProfile); // Uses ID from token (secure)

// ⚠️ VULNERABILITY 2: Broken Authorization / IDOR Reset Password
router.post('/reset_password', authenticateToken, resetPassword);

module.exports = router;
