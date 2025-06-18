// server/controllers/documentationController.js
const db = require('../db');

// @desc    Get all documentation sections for a project
// @route   GET /api/documentation/project/:projectId
// @access  Private
exports.getDocumentation = async (req, res) => {
    try {
        const [sections] = await db.query('SELECT * FROM documentation_sections WHERE project_id = ?', [req.params.projectId]);
        res.json(sections);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new documentation section
// @route   POST /api/documentation
// @access  Private (Admin only)
exports.createDocSection = async (req, res) => {
    const { project_id, title, content } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO documentation_sections (project_id, title, content) VALUES (?, ?, ?)',
            [project_id, title, content || '']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Update a documentation section
// @route   PUT /api/documentation/:id
// @access  Private (Admin only)
exports.updateDocSection = async (req, res) => {
    const { title, content } = req.body;
    try {
        await db.query(
            'UPDATE documentation_sections SET title = ?, content = ? WHERE id = ?',
            [title, content, req.params.id]
        );
        res.json({ msg: 'Documentation section updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};