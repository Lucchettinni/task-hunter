// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All task routes are protected
router.use(protect);

router.get('/project/:projectId', getTasksByProject);
router.post('/', isAdmin, createTask);

router.put('/:id', updateTask);
router.delete('/:id', isAdmin, deleteTask);

module.exports = router;