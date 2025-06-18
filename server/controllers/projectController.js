// server/controllers/projectController.js
const db = require('../db');

// @desc    Get all projects for the logged-in user or all projects for admins
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'admin') {
            // Admin sees all projects
            const [allProjects] = await db.query(`
                SELECT p.*, (SELECT COUNT(*) FROM project_users pu WHERE pu.project_id = p.id) as user_count
                FROM projects p
            `);
            projects = allProjects;
        } else {
            // Normal user sees only their projects
            const [userProjects] = await db.query(`
                SELECT p.*, (SELECT COUNT(*) FROM project_users pu WHERE pu.project_id = p.id) as user_count
                FROM projects p
                JOIN project_users pu ON p.id = pu.project_id
                WHERE pu.user_id = ?
            `, [req.user.id]);
            projects = userProjects;
        }
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = async (req, res) => {
    const { title, description, image_url } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)',
            [title, description, image_url]
        );
        // Automatically add the admin who created it to the project
        await db.query('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [result.insertId, req.user.id]);

        res.status(201).json({ id: result.insertId, title, description, image_url });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res) => {
    const { title, description, image_url } = req.body;
    try {
        await db.query(
            'UPDATE projects SET title = ?, description = ?, image_url = ? WHERE id = ?',
            [title, description, image_url, req.params.id]
        );
        res.json({ message: 'Project updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Add a user to a project
// @route   POST /api/projects/:id/users
// @access  Private (Admin only)
exports.addUserToProject = async (req, res) => {
    const { userId } = req.body;
    const projectId = req.params.id;
    try {
        await db.query('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [projectId, userId]);
        res.status(201).json({ message: 'User added to project' });
    } catch (err) {
        // Handle cases where the user is already in the project (duplicate primary key)
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'User is already in this project.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res) => {
    try {
        // First, check if the project exists.
        const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (projects.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Project and all associated data removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};