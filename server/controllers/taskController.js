// server/controllers/taskController.js
const db = require('../db');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
exports.getTasksByProject = async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = ?', [req.params.projectId]);
        
        // Safely parse tags for each task
        const parsedTasks = tasks.map(task => {
            let parsedTags = [];
            try {
                // Ensure task.tags is a string and not empty before parsing
                if (task.tags && typeof task.tags === 'string') {
                    parsedTags = JSON.parse(task.tags);
                } 
                // Some DB drivers might auto-parse JSON columns, so if it's already an array, use it
                else if (Array.isArray(task.tags)) {
                    parsedTags = task.tags;
                }
            } catch (e) {
                // If parsing fails, log the error and default to an empty array
                console.error(`Could not parse tags for task ID ${task.id}. Tags value:`, task.tags);
                parsedTags = [];
            }
            return { ...task, tags: parsedTags };
        });

        res.json(parsedTasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    // Only admins can create tasks
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
    }
    const { project_id, title, description, priority, tags } = req.body;
    try {
        // We store tags as a JSON string in the database.
        const tagsJson = JSON.stringify(tags || []);
        const [result] = await db.query(
            'INSERT INTO tasks (project_id, title, description, priority, tags, status) VALUES (?, ?, ?, ?, ?, ?)',
            [project_id, title, description, priority, tagsJson, 'to do']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a task's status or details
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    const taskId = req.params.id;
    const { role } = req.user;
    const newValues = req.body;

    try {
        // 1. Fetch the existing task from the database
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (tasks.length === 0) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        const existingTask = tasks[0];

        // 2. Authorization: Non-admins can only update the 'status' field.
        if (role !== 'admin') {
            const allowedKeys = ['status'];
            const receivedKeys = Object.keys(newValues);
            if (receivedKeys.some(key => !allowedKeys.includes(key))) {
                 return res.status(403).json({ message: 'Not authorized to edit task details.' });
            }
        }
        
        // 3. Merge existing data with the new values to prevent nulling fields
        const updatedTaskData = { ...existingTask, ...newValues };

        // 4. Ensure tags are stored as a JSON string
        const tagsJson = JSON.stringify(updatedTaskData.tags || []);

        // 5. Build and execute the final UPDATE query with all fields
        const sql = `UPDATE tasks SET 
            title = ?, 
            description = ?, 
            status = ?, 
            priority = ?, 
            tags = ? 
          WHERE id = ?`;
        
        await db.query(sql, [
            updatedTaskData.title,
            updatedTaskData.description,
            updatedTaskData.status,
            updatedTaskData.priority,
            tagsJson,
            taskId
        ]);
        
        res.json({ message: 'Task updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = async (req, res) => {
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};