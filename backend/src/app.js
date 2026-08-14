const express = require('express');
const {
  getBoardWithDetails,
  getColumnById,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} = require('./db');

const app = express();
app.use(express.json());

const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];

// GET /api/boards/:boardId - Retrieve board with nested columns & tasks
app.get('/api/boards/:boardId', (req, res, next) => {
  try {
    const boardId = Number(req.params.boardId);
    if (isNaN(boardId)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    const board = getBoardWithDetails(undefined, boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res, next) => {
  try {
    const { title, description, priority, columnId } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required and cannot be empty' });
    }

    if (columnId === undefined || columnId === null || isNaN(Number(columnId))) {
      return res.status(400).json({ error: 'Valid columnId is required' });
    }

    const column = getColumnById(undefined, Number(columnId));
    if (!column) {
      return res.status(400).json({ error: 'Destination column not found' });
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority level. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}`,
      });
    }

    const task = createTask(undefined, {
      columnId: Number(columnId),
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      priority: priority || 'Medium',
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id - Update task title, description, priority
app.put('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const existingTask = getTaskById(undefined, taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, priority } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required and cannot be empty' });
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority level. Allowed values: ${ALLOWED_PRIORITIES.join(', ')}`,
      });
    }

    const updatedTask = updateTask(undefined, taskId, {
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      priority: priority || existingTask.priority,
    });

    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const existingTask = getTaskById(undefined, taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    deleteTask(undefined, taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/move - Move task to a different column
app.patch('/api/tasks/:id/move', (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const existingTask = getTaskById(undefined, taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { columnId } = req.body;
    if (columnId === undefined || columnId === null || isNaN(Number(columnId))) {
      return res.status(400).json({ error: 'Valid destination columnId is required' });
    }

    const column = getColumnById(undefined, Number(columnId));
    if (!column) {
      return res.status(400).json({ error: 'Destination column not found' });
    }

    const updatedTask = moveTask(undefined, taskId, Number(columnId));
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err.message || err);
  res.status(err.status || 500).json({ error: err.message || 'An unexpected server error occurred' });
});

module.exports = app;
