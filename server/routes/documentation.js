// server/routes/documentation.js
const express = require('express');
const router = express.Router();
const {
    getDocumentation,
    createDocSection,
    updateDocSection
} = require('../controllers/documentationController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/project/:projectId', getDocumentation);
router.post('/', isAdmin, createDocSection);
router.put('/:id', isAdmin, updateDocSection);

module.exports = router;