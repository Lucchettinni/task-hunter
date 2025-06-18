// server/routes/users.js
const express = require('express');
const router = express.Router();
const { getAllUsers, updateTheme, updateProfile, updatePassword } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', isAdmin, getAllUsers);
router.put('/theme', updateTheme);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

module.exports = router;