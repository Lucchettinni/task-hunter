// server/routes/documentation.js
const express = require('express');
const router = express.Router();
const {
    getDocumentation,
    createDocSection,
    updateDocSection,
    deleteDocSection
} = require('../controllers/documentationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/project/:projectId', getDocumentation);
router.post('/', isAdmin, createDocSection);
router.put('/:id', isAdmin, updateDocSection);
router.delete('/:id', isAdmin, deleteDocSection);

module.exports = router;