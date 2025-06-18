// server/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        const [userExists] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (role is 'user' by default)
        const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        const newUser = { id: result.insertId, username, role: 'user' };
        
        // Create and sign a JWT
        const token = jwt.sign({ user: newUser }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(201).json({ token, user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        const userPayload = {
            id: user.id,
            username: user.username,
            role: user.role,
            theme: user.theme // The theme is correctly included here
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