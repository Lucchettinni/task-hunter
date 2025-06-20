// server/controllers/userController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    return jwt.sign({ user: userPayload }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    // The name comes from the form body
    const { name } = req.body;
    const userId = req.user.id;
    
    // Get the existing user data to have a fallback for the image URL
    const [existingUsers] = await db.query('SELECT profile_image_url FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
    }
    
    // Start with the existing URL
    let profile_image_url = existingUsers[0].profile_image_url; 
    
    // If a new file was uploaded by multer, update the URL to the new path.
    if (req.file) {
        profile_image_url = `/uploads/profile-pictures/${req.file.filename}`;
    }

    try {
        await db.query('UPDATE users SET name = ?, profile_image_url = ? WHERE id = ?', [name, profile_image_url, userId]);
        
        // Fetch the fully updated user record
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const updatedUser = users[0];

        // Generate a new JWT with the updated user details
        const token = generateToken(updatedUser);

        res.json({ 
            message: 'Profile updated successfully',
            token: token,
            user: updatedUser
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