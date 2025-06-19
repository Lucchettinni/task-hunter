// server/routes/chat.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    getChannels, 
    createChannel, 
    getMessages, 
    updateChannel, 
    deleteChannel,
    createCategory,
    updateCategory,
    deleteCategory,
	reorderCategories,
    reorderChannels // Changed from updateChannelOrder
} = require('../controllers/chatController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }
}).single('chat-attachment');

// --- Routes ---
router.use(protect);

router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file.', error: err });
        }
        if (req.file == undefined) {
            return res.status(400).json({ message: 'No file selected!' });
        }
        res.json({
            message: 'File uploaded successfully!',
            filePath: `/uploads/${req.file.filename}`
        });
    });
});

// Category Routes
router.post('/categories', isAdmin, createCategory);
router.put('/categories/:categoryId', isAdmin, updateCategory);
router.delete('/categories/:categoryId', isAdmin, deleteCategory);
router.put('/categories/reorder', isAdmin, reorderCategories);

// Channel Routes
router.get('/channels/:projectId', getChannels);
router.post('/channels', isAdmin, createChannel);
router.put('/channels/:channelId', isAdmin, updateChannel);
router.delete('/channels/:channelId', isAdmin, deleteChannel);
router.put('/reorder', isAdmin, reorderChannels); // Changed this line

// Message Routes
router.get('/messages/:channelId', getMessages);


module.exports = router;