// server/routes/users.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAllUsers, updateTheme, updateProfile, updatePassword } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- Multer Configuration for Profile Images ---
// This configures how files are stored.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be stored in 'public/uploads/profile-pictures/'
        cb(null, './public/uploads/profile-pictures/');
    },
    filename: function(req, file, cb) {
        // Creates a unique filename to prevent overwrites: 'profile'-<userId>-<timestamp>.<extension>
        cb(null, 'profile-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

// This function filters files to only allow images.
const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!')); // Pass an error to multer
    }
};

// Initialize multer upload middleware with the defined storage, limits, and file filter.
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB size limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('profileImage'); // This expects a single file in a form field named 'profileImage'

// Protect all routes in this file
router.use(protect);

// Define routes
router.get('/', isAdmin, getAllUsers);
router.put('/theme', updateTheme);
// The 'upload' middleware is applied here. It will process the file upload
// before the updateProfile controller is called.
router.put('/profile', upload, updateProfile);
router.put('/password', updatePassword);

module.exports = router;