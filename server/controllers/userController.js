// server/controllers/userController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jwt

// Helper to generate token with a full user payload
const generateToken = (user) => {
    const userPayload = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        profile_image_url: user.profile_image_url,
        role: user.role,
        theme: user.theme,
        primary_color: user.primary_color
    };
    return jwt.sign({ user: userPayload }, 'your_jwt_secret', { expiresIn: '1h' });
};

// @desc    Get all users (for admins to add to projects)
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, username, name, role FROM users WHERE role = 'user'");
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user's theme preference and primary color
// @route   PUT /api/users/theme
// @access  Private
exports.updateTheme = async (req, res) => {
    const { theme, primary_color } = req.body;
    const userId = req.user.id;
    try {
        await db.query('UPDATE users SET theme = ?, primary_color = ? WHERE id = ?', [theme, primary_color, userId]);
        
        // Fetch the updated user to create a new token
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found after update.' });
        }
        const updatedUser = users[0];

        // Generate a new token with updated info
        const token = generateToken(updatedUser);

        res.json({ 
            message: 'Theme updated successfully',
            token: token, // Send the new token back
            user: updatedUser // Send the updated user object back
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user's profile info (name, image)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    const { name, profile_image_url } = req.body;
    const userId = req.user.id;
    try {
        await db.query('UPDATE users SET name = ?, profile_image_url = ? WHERE id = ?', [name, profile_image_url || null, userId]);
        
        // Fetch the updated user to create a new token
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found after update.' });
        }
        const updatedUser = users[0];

        // Generate a new token with updated info
        const token = generateToken(updatedUser);

        res.json({ 
            message: 'Profile updated successfully',
            token: token, // Send the new token back
            user: updatedUser // Send the updated user object back
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user's password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }
    
    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};