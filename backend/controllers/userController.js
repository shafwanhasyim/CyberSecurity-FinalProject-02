// controllers/userController.js
// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 5;

const getAllUsers = async (req, res) => {
	try {
		const result = await pool.query(
			'SELECT id, username, email, full_name, is_admin, created_at, updated_at FROM users'
		);

		res.json(result.rows.map((user) => ({
			id: user.id,
			username: user.username,
			email: user.email,
			full_name: user.full_name,
			is_admin: user.is_admin,
			created_at: user.created_at,
			updated_at: user.updated_at
		})));
	} catch (err) {
		console.error('Error fetching all users:', err);
		res.status(500).json({ error: 'Database error' });
	}
};

const getUserProfile = async (req, res) => {
	const targetId = req.params.id;

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

const updateProfile = async (req, res) => {
	const userId = req.user.id;
	const { full_name: fullName, email } = req.body;

	try {
		const result = await pool.query(
			`UPDATE users SET full_name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $3 RETURNING id, username, email, full_name`,
			[fullName, email, userId]
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

const resetPassword = async (req, res) => {
	const requesterId = req.user.id;
	const {
		current_password: currentPassword,
		new_password: newPassword,
		target_user_id: targetUserId
	} = req.body;

	if (!newPassword) {
		return res.status(400).json({ error: 'New password is required.' });
	}

	const targetId = req.user.is_admin && targetUserId ? targetUserId : requesterId;

	if (!req.user.is_admin && targetId !== requesterId) {
		return res.status(403).json({ error: 'You are not allowed to change this password.' });
	}

	if (!req.user.is_admin && !currentPassword) {
		return res.status(400).json({ error: 'Current password is required.' });
	}

	try {
		const userResult = await pool.query(
			'SELECT password_hash FROM users WHERE id = $1',
			[targetId]
		);

		if (userResult.rowCount === 0) {
			return res.status(404).json({ error: 'User not found.' });
		}

		const existingHash = userResult.rows[0].password_hash;

		if (!req.user.is_admin) {
			const passwordMatches = await bcrypt.compare(currentPassword, existingHash);
			if (!passwordMatches) {
				return res.status(401).json({ error: 'Current password is incorrect.' });
			}

			const newMatchesOld = await bcrypt.compare(newPassword, existingHash);
			if (newMatchesOld) {
				return res.status(400).json({ error: 'New password must be different from the current password.' });
			}
		}

		const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

		const updateResult = await pool.query(
			'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
			[newHash, targetId]
		);

		if (updateResult.rowCount === 0) {
			return res.status(404).json({ error: 'User not found or update failed.' });
		}

		res.json({ message: 'Password updated successfully.' });
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
