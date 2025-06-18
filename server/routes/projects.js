// server/routes/projects.js
const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, addUserToProject, deleteProject } = require('../controllers/projectController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// All these routes are protected
router.use(protect);

router.route('/')
    .get(getProjects)
    .post(isAdmin, createProject);

router.route('/:id')
    .put(isAdmin, updateProject)
    .delete(isAdmin, deleteProject);
    
router.route('/:id/users')
    .post(isAdmin, addUserToProject);

module.exports = router;