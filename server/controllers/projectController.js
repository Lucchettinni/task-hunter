// server/controllers/projectController.js
const db = require('../db');

// @desc    Get all projects for the logged-in user or all projects for admins
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'admin') {
            const [allProjects] = await db.query(`
                SELECT p.*, (SELECT COUNT(*) FROM project_users pu WHERE pu.project_id = p.id) as user_count
                FROM projects p
            `);
            projects = allProjects;
        } else {
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
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [projectResult] = await connection.query(
            'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)',
            [title, description, image_url]
        );
        const projectId = projectResult.insertId;

        await connection.query('INSERT INTO project_users (project_id, user_id) VALUES (?, ?)', [projectId, req.user.id]);

        // Create a default category
        const [categoryResult] = await connection.query(
            'INSERT INTO channel_categories (project_id, name) VALUES (?, ?)',
            [projectId, 'Text Channels']
        );
        const defaultCategoryId = categoryResult.insertId;

        // Create 3 default chat channels within the new category
        const defaultChannels = ['General', 'Development', 'Art'];
        for (const channelName of defaultChannels) {
            await connection.query(
                'INSERT INTO channels (project_id, name, category_id) VALUES (?, ?, ?)', 
                [projectId, channelName, defaultCategoryId]
            );
        }
        
        const dummyTasks = [
            ['Design main character', 'Create concept art and 3D model for the protagonist.', 'high', '["art", "character"]'],
            ['Implement player movement', 'Develop the core movement mechanics including walking, running, and jumping.', 'high', '["programming", "core-gameplay"]'],
            ['Setup initial game world', 'Create the first level with basic assets and lighting.', 'medium', '["level-design", "environment"]']
        ];
        for (const task of dummyTasks) {
            await connection.query(
                'INSERT INTO tasks (project_id, title, description, priority, tags, status) VALUES (?, ?, ?, ?, ?, ?)',
                [projectId, ...task, 'to do']
            );
        }

        const documentationSections = {
            'Game Overview': 'Space Adventure RPG is an ambitious project combining exploration with deep RPG mechanics...',
            'Game Mechanics': 'Core mechanics include: Ship customization, Combat system, Resource management...',
            'Story & Lore': 'Set in the year 2385, humanity has colonized multiple star systems...',
            'Art Direction': 'Visual style: Retro-futuristic with vibrant colors and clean UI...',
            'Technical Specifications': 'Engine: Unity 2023 LTS, Target platforms: PC, Console...',
            'Development Timeline': 'Q1 2024: Pre-production, Q2 2024: Alpha, Q3 2024: Beta...'
        };
        for (const [docTitle, docContent] of Object.entries(documentationSections)) {
            await connection.query(
                'INSERT INTO documentation_sections (project_id, title, content) VALUES (?, ?, ?)',
                [projectId, docTitle, docContent]
            );
        }

        await connection.commit();
        res.status(201).json({ id: projectId, title, description, image_url });

    } catch (err) {
        await connection.rollback();
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        connection.release();
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
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'User is already in this project.' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all users for a project
// @route   GET /api/projects/:id/users
// @access  Private
exports.getProjectUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.username, u.role FROM users u 
             JOIN project_users pu ON u.id = pu.user_id 
             WHERE pu.project_id = ?`,
            [req.params.id]
        );
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Remove a user from a project
// @route   DELETE /api/projects/:id/users/:userId
// @access  Private (Admin only)
exports.removeUserFromProject = async (req, res) => {
    const { id: projectId, userId } = req.params;
    try {
        await db.query(
            'DELETE FROM project_users WHERE project_id = ? AND user_id = ?',
            [projectId, userId]
        );
        res.json({ message: 'User removed from project' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res) => {
    try {
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