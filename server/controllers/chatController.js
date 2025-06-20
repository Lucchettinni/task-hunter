// server/controllers/chatController.js
const db = require('../db');

// --- Category Controllers ---
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
        req.io.to(String(project_id)).emit('chat_structure_updated');
        res.status(201).json({ id: result.insertId, project_id, name, channels: [] });
    } catch (err) {
        console.error("Error creating category:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const { categoryId } = req.params;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Category name cannot be empty.' });
    }
    try {
        const [[category]] = await db.query('SELECT project_id FROM channel_categories WHERE id = ?', [categoryId]);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        await db.query('UPDATE channel_categories SET name = ? WHERE id = ?', [name.trim(), categoryId]);
        
        req.io.to(String(category.project_id)).emit('chat_structure_updated');
        res.json({ message: 'Category updated successfully.' });
    } catch (err) {
        console.error("Error updating category:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteCategory = async (req, res) => {
    const { categoryId } = req.params;
    try {
        const [[category]] = await db.query('SELECT project_id FROM channel_categories WHERE id = ?', [categoryId]);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        await db.query('DELETE FROM channel_categories WHERE id = ?', [categoryId]);
        
        req.io.to(String(category.project_id)).emit('chat_structure_updated');
        res.json({ message: 'Category deleted successfully.' });
    } catch (err) {
        console.error("Error deleting category:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.reorderCategories = async (req, res) => {
    const { projectId, orderedCategoryIds } = req.body;
    if (!projectId || !Array.isArray(orderedCategoryIds)) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const updatePromises = orderedCategoryIds.map((categoryId, index) => 
            connection.query('UPDATE channel_categories SET sort_order = ? WHERE id = ? AND project_id = ?', [index, categoryId, projectId])
        );
        await Promise.all(updatePromises);
        await connection.commit();
        
        req.io.to(String(projectId)).emit('chat_structure_updated');
        res.json({ message: 'Category order updated successfully.' });
    } catch (err) {
        await connection.rollback();
        console.error("Error in reorderCategories:", err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
};

// --- Channel Controllers ---
exports.getChannels = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM channel_categories WHERE project_id = ? ORDER BY sort_order ASC, name ASC', [req.params.projectId]);
        const [channels] = await db.query('SELECT * FROM channels WHERE project_id = ? ORDER BY category_id ASC, sort_order ASC, name ASC', [req.params.projectId]);

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

exports.createChannel = async (req, res) => {
    const { project_id, name, category_id } = req.body;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Channel name cannot be empty.' });
    }
    try {
        const [result] = await db.query('INSERT INTO channels (project_id, name, category_id) VALUES (?, ?, ?)', [project_id, name.trim(), category_id || null]);
        req.io.to(String(project_id)).emit('chat_structure_updated');
        res.status(201).json({ id: result.insertId, project_id, name, category_id });
    } catch (err) {
        console.error("Error creating channel:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateChannel = async (req, res) => {
    const { name } = req.body;
    const { channelId } = req.params;
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Channel name cannot be empty.' });
    }
    try {
        const [[channel]] = await db.query('SELECT project_id FROM channels WHERE id = ?', [channelId]);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });

        await db.query('UPDATE channels SET name = ? WHERE id = ?', [name.trim(), channelId]);
        
        req.io.to(String(channel.project_id)).emit('chat_structure_updated');
        res.json({ message: 'Channel updated successfully.' });
    } catch (err) {
        console.error("Error updating channel:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.reorderChannels = async (req, res) => {
    const { projectId, orderData } = req.body;
    if (!projectId || !Array.isArray(orderData)) {
        return res.status(400).json({ message: 'Invalid payload.' });
    }
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const updatePromises = [];
        for (const category of orderData) {
            const categoryId = category.categoryId ? parseInt(category.categoryId, 10) : null;
            if (isNaN(categoryId) && categoryId !== null) continue;

            category.channels.forEach((channelId, index) => {
                const promise = connection.query('UPDATE channels SET category_id = ?, sort_order = ? WHERE id = ? AND project_id = ?', [categoryId, index, channelId, projectId]);
                updatePromises.push(promise);
            });
        }
        await Promise.all(updatePromises);
        await connection.commit();
        
        req.io.to(String(projectId)).emit('chat_structure_updated');
        res.json({ message: 'Channel order updated successfully.' });
    } catch (err) {
        await connection.rollback();
        console.error("Error in reorderChannels:", err.message);
        res.status(500).send('Server Error');
    } finally {
        if (connection) connection.release();
    }
};

exports.deleteChannel = async (req, res) => {
    const { channelId } = req.params;
    try {
        const [[channel]] = await db.query('SELECT project_id FROM channels WHERE id = ?', [channelId]);
        if (!channel) return res.status(404).json({ message: 'Channel not found' });
        
        await db.query('DELETE FROM chat_messages WHERE channel_id = ?', [channelId]);
        await db.query('DELETE FROM channels WHERE id = ?', [channelId]);
        
        req.io.to(String(channel.project_id)).emit('chat_structure_updated');
        res.json({ message: 'Channel deleted successfully.' });
    } catch (err) {
        console.error("Error deleting channel:", err.message);
        res.status(500).send('Server Error');
    }
};


// --- Message Controllers ---
exports.getMessages = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;
    const offset = (page - 1) * limit;

    try {
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM chat_messages WHERE channel_id = ?', [req.params.channelId]);
        const [messages] = await db.query(`SELECT cm.*, u.username, u.profile_image_url, u.primary_color FROM chat_messages cm JOIN users u ON cm.user_id = u.id WHERE cm.channel_id = ? ORDER BY cm.created_at DESC LIMIT ? OFFSET ?`, [req.params.channelId, limit, offset]);
        
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