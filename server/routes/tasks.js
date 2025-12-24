const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

// GET all tasks (sorted by order) - Protected
router.get('/tasks', protect, async (req, res) => {
  try {
    // Only get tasks for the logged-in user
    const tasks = await Task.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks',
      message: error.message 
    });
  }
});

// POST create a new task - Protected
router.post('/tasks', protect, async (req, res) => {
  try {
    const { text, priority, category, dueDate } = req.body;

    // Validation
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        error: 'Task text is required' 
      });
    }

    // Get the highest order value for this user's tasks
    const highestOrderTask = await Task.findOne({ userId: req.user.id }).sort({ order: -1 });
    const newOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const task = new Task({
      userId: req.user.id, // Associate task with logged-in user
      text: text.trim(),
      priority: priority || 'medium',
      category: category || '',
      dueDate: dueDate || null,
      order: newOrder,
      completed: false
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ 
      error: 'Failed to create task',
      message: error.message 
    });
  }
});

// PUT update a task - Protected
router.put('/tasks/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Find task and verify ownership
    const task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ 
      error: 'Failed to update task',
      message: error.message 
    });
  }
});

// DELETE a task - Protected
router.delete('/tasks/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Find and delete only if user owns the task
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    res.json({ 
      message: 'Task deleted successfully',
      task 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: 'Failed to delete task',
      message: error.message 
    });
  }
});

// PATCH reorder tasks (for drag and drop) - Protected
router.patch('/tasks/reorder', protect, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ 
        error: 'Tasks must be an array' 
      });
    }

    // Update each task's order (only for user's own tasks)
    const updatePromises = tasks.map((task, index) => {
      return Task.findOneAndUpdate(
        { _id: task._id || task.id, userId: req.user.id },
        { order: index },
        { new: true }
      );
    });

    const updatedTasks = await Promise.all(updatePromises);
    res.json(updatedTasks);
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(400).json({ 
      error: 'Failed to reorder tasks',
      message: error.message 
    });
  }
});

module.exports = router;
