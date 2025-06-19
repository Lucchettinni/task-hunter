// server/controllers/chatController.js
const db = require('../db');

// @desc    Update the sort order of all categories for a project.
// @route   PUT /api/chat/categories/reorder
// @access  Private (Admin only)
exports.reorderCategories = async (req, res) => {
    const { projectId, orderedCategoryIds } = req.body;
    if (!projectId || !Array.isArray(orderedCategoryIds)) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const updatePromises = orderedCategoryIds.map((categoryId, index) => {
            return connection.query(
                'UPDATE channel_categories SET sort_order = ? WHERE id = ? AND project_id = ?',
                [index, categoryId, projectId]
            );
        });
        
        await Promise.all(updatePromises);

        await connection.commit();
        res.json({ message: 'Category order updated successfully.' });

    } catch (err) {
        await connection.rollback();
        console.error("Error in reorderCategories:", err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
};

// --- Category Controllers ---

// @desc    Create a new channel category
// @route   POST /api/chat/categories
// @access  Private (Admin only)
exports.createCategory = async (req, res) => {
    const { project_id, name } = req.body;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Category name cannot be empty.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO channel_categories (project_id, name) VALUES (?, ?)',
            [project_id, name.trim()]
        );
        res.status(201).json({ id: result.insertId, project_id, name, channels: [] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a category's name
// @route   PUT /api/chat/categories/:categoryId
// @access  Private (Admin only)
exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const { categoryId } = req.params;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Category name cannot be empty.' });
    }
    try {
        await db.query('UPDATE channel_categories SET name = ? WHERE id = ?', [name.trim(), categoryId]);
        res.json({ message: 'Category updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a category
// @route   DELETE /api/chat/categories/:categoryId
// @access  Private (Admin only)
exports.deleteCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        await db.query('DELETE FROM channel_categories WHERE id = ?', [categoryId]);
        res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Channel Controllers (Updated) ---

// @desc    Get all channels for a project, grouped by category
// @route   GET /api/chat/channels/:projectId
// @access  Private
exports.getChannels = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM channel_categories WHERE project_id = ? ORDER BY sort_order ASC, name ASC', [req.params.projectId]);
        const [channels] = await db.query('SELECT * FROM channels WHERE project_id = ? ORDER BY sort_order ASC, name ASC', [req.params.projectId]);

        const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, channels: [] }]));
        const uncategorized = { id: null, name: 'Uncategorized', channels: [] };

        for (const channel of channels) {
            if (channel.category_id && categoryMap.has(channel.category_id)) {
                categoryMap.get(channel.category_id).channels.push(channel);
            } else {
                uncategorized.channels.push(channel);
            }
        }

        const result = [...categoryMap.values()];
        if (uncategorized.channels.length > 0) {
            result.push(uncategorized);
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new channel
// @route   POST /api/chat/channels
// @access  Private (Admin only)
exports.createChannel = async (req, res) => {
    const { project_id, name, category_id } = req.body;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Channel name cannot be empty.' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO channels (project_id, name, category_id) VALUES (?, ?, ?)',
            [project_id, name.trim(), category_id || null]
        );
        res.status(201).json({ id: result.insertId, project_id, name, category_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a channel's details (name)
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

// @desc    Update the order and categories of all channels for a project.
// @route   PUT /api/chat/reorder
// @access  Private (Admin only)
exports.reorderChannels = async (req, res) => {
    const { projectId, orderData } = req.body;
    const connection = await db.getConnection();

    if (!projectId || !Array.isArray(orderData)) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }

    try {
        await connection.beginTransaction();

        const updatePromises = [];

        for (const category of orderData) {
            // Ensure categoryId is a valid value (or null)
            const categoryId = category.categoryId ? parseInt(category.categoryId, 10) : null;
            if (isNaN(categoryId) && categoryId !== null) continue; // Skip if categoryId is invalid

            for (let i = 0; i < category.channels.length; i++) {
                const channelId = category.channels[i];
                const sortOrder = i;
                
                const promise = connection.query(
                    'UPDATE channels SET category_id = ?, sort_order = ? WHERE id = ? AND project_id = ?',
                    [categoryId, sortOrder, channelId, projectId]
                );
                updatePromises.push(promise);
            }
        }
        
        // Wait for all update queries to complete
        await Promise.all(updatePromises);

        await connection.commit();
        res.json({ message: 'Channel order updated successfully.' });

    } catch (err) {
        await connection.rollback();
        console.error("Error in reorderChannels:", err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
};

// @desc    Delete a channel
// @route   DELETE /api/chat/channels/:channelId
// @access  Private (Admin only)
exports.deleteChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = (page - 1) * limit;

    try {
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM chat_messages WHERE channel_id = ?', [req.params.channelId]);

        const [messages] = await db.query(`
            SELECT cm.*, u.username, u.profile_image_url, u.primary_color 
            FROM chat_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.channel_id = ? 
            ORDER BY cm.created_at DESC
            LIMIT ?
            OFFSET ?
        `, [req.params.channelId, limit, offset]);
        
        // Reverse to show oldest first for infinite scroll from top
        res.json({
            messages: messages.reverse(),
            currentPage: page,
            hasMore: (page * limit) < total
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};