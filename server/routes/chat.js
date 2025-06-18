// server/routes/chat.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getChannels, createChannel, getMessages, updateChannel, deleteChannel } = require('../controllers/chatController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        // Create a unique filename to prevent overwriting
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // Limit file size to 10MB
}).single('chat-attachment'); // 'chat-attachment' will be the name of the form field

// --- Routes ---
router.use(protect);

// New endpoint for handling file uploads
router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file.', error: err });
        }
        if (req.file == undefined) {
            return res.status(400).json({ message: 'No file selected!' });
        }
        // Return the public URL of the uploaded file
        res.json({
            message: 'File uploaded successfully!',
            // The path will be like /uploads/chat-attachment-1678886400000.png
            filePath: `/uploads/${req.file.filename}`
        });
    });
});

// Channel Routes
router.get('/channels/:projectId', getChannels);
router.post('/channels', isAdmin, createChannel);
router.put('/channels/:channelId', isAdmin, updateChannel); // New route
router.delete('/channels/:channelId', isAdmin, deleteChannel); // New route

// Message Routes
router.get('/messages/:channelId', getMessages);

module.exports = router;