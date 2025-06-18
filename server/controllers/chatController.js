// server/controllers/chatController.js
const db = require('../db');

// @desc    Get all channels for a project
// @route   GET /api/chat/channels/:projectId
// @access  Private
exports.getChannels = async (req, res) => {
    try {
        const [channels] = await db.query('SELECT * FROM channels WHERE project_id = ? ORDER BY name ASC', [req.params.projectId]);
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
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Channel name cannot be empty.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO channels (project_id, name) VALUES (?, ?)',
            [project_id, name.trim()]
        );
        res.status(201).json({ id: result.insertId, project_id, name });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a channel's name
// @route   PUT /api/chat/channels/:channelId
// @access  Private (Admin only)
exports.updateChannel = async (req, res) => {
    const { name } = req.body;
    const { channelId } = req.params;
     if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Channel name cannot be empty.' });
    }
    try {
        await db.query('UPDATE channels SET name = ? WHERE id = ?', [name.trim(), channelId]);
        res.json({ message: 'Channel updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a channel
// @route   DELETE /api/chat/channels/:channelId
// @access  Private (Admin only)
exports.deleteChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
        // You might want to also delete all messages in this channel
        await db.query('DELETE FROM chat_messages WHERE channel_id = ?', [channelId]);
        await db.query('DELETE FROM channels WHERE id = ?', [channelId]);
        res.json({ message: 'Channel deleted successfully.' });
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