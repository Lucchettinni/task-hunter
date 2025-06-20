// server/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    // The profile_image_url is now removed from signup. It will be null by default.
    // Users can upload an image after creating their account.
    const { username, password, name, email } = req.body;

    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: 'Please enter all required fields: username, password, name, and email.' });
    }

    try {
        // Check if user already exists
        const [userExists] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User with that username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set profile_image_url to NULL by default.
        const [result] = await db.query(
            'INSERT INTO users (username, password, name, email, profile_image_url, theme, primary_color) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, name, email, null, 'light', '#1976d2']
        );
        
        const newUserPayload = { 
            id: result.insertId, 
            username, 
            name,
            email,
            profile_image_url: null, // Starts as null
            role: 'user',
            theme: 'light',
            primary_color: '#1976d2'
        };
        
        const token = jwt.sign({ user: newUserPayload }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(201).json({ token, user: newUserPayload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check for user
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Ensure all relevant fields are included in the payload
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
        
        // Create and sign a JWT
        const token = jwt.sign({ user: userPayload }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token, user: userPayload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, login };