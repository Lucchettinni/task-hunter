// server/routes/projects.js
const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    createProject, 
    updateProject, 
    addUserToProject, 
    deleteProject,
    getProjectUsers,
    removeUserFromProject
} = require('../controllers/projectController');
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
    .get(getProjectUsers)
    .post(isAdmin, addUserToProject);

router.route('/:id/users/:userId')
    .delete(isAdmin, removeUserFromProject);

module.exports = router;