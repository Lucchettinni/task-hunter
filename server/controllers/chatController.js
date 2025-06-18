// server/controllers/chatController.js
const db = require('../db');

// @desc    Get all channels for a project
// @route   GET /api/chat/channels/:projectId
// @access  Private
exports.getChannels = async (req, res) => {
    try {
        const [channels] = await db.query('SELECT * FROM channels WHERE project_id = ?', [req.params.projectId]);
        res.json(channels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new channel
// @route   POST /api/chat/channels
// @access  Private (Admin only)
exports.createChannel = async (req, res) => {
    const { project_id, name } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO channels (project_id, name) VALUES (?, ?)',
            [project_id, name]
        );
        res.status(201).json({ id: result.insertId, project_id, name });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all messages for a channel
// @route   GET /api/chat/messages/:channelId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const [messages] = await db.query(`
            SELECT cm.*, u.username 
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.channel_id = ? 
            ORDER BY cm.created_at ASC
        `, [req.params.channelId]);
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};