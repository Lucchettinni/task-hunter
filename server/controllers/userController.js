// server/controllers/userController.js
const db = require('../db');

// @desc    Get all users (for admins to add to projects)
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // Select only id and username to avoid exposing sensitive info
        const [users] = await db.query("SELECT id, username, role FROM users WHERE role = 'user'");
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user's theme preference
// @route   PUT /api/users/theme
// @access  Private
exports.updateTheme = async (req, res) => {
    const { theme } = req.body;
    const userId = req.user.id;
    try {
        await db.query('UPDATE users SET theme = ? WHERE id = ?', [theme, userId]);
        res.json({ message: 'Theme updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};