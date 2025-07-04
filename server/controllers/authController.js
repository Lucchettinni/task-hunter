// server/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    // Updated to include name, email, and optional profile_image_url
    const { username, password, name, email, profile_image_url } = req.body;

    if (!username || !password || !name || !email) {
        return res.status(400).json({ message: 'Please enter all required fields: username, password, name, and email.' });
    }

    try {
        // Check if user already exists by username or email
        const [userExists] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User with that username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in the database
        const [result] = await db.query(
            'INSERT INTO users (username, password, name, email, profile_image_url, theme, primary_color) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, name, email, profile_image_url || null, 'light', '#1976d2'] // Defaults to light theme
        );
        
        const newUserPayload = { 
            id: result.insertId, 
            username, 
            name,
            email,
            profile_image_url: profile_image_url || null,
            role: 'user', // Default role
            theme: 'light',
            primary_color: '#1976d2'
        };
        
        // Create and sign a JWT
        const token = jwt.sign({ user: newUserPayload }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
        const token = jwt.sign({ user: userPayload }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: userPayload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { signup, login };