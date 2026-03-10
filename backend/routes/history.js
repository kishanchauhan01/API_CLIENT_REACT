const express = require('express');
const { History } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// POST /api/history — create a history entry (for browser-mode requests)
router.post('/', async (req, res) => {
  try {
    const { method, url, status, duration, responseBody } = req.body;
    if (!method || !url) {
      return res.status(400).json({ message: 'Method and URL are required' });
    }
    const entry = await History.create({
      userId: req.userId,
      method: method.toUpperCase(),
      url,
      status: status || 0,
      duration: duration || '0ms',
      responseBody: (responseBody || '').substring(0, 50000),
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Create history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const history = await History.findAll({
      where: { userId: req.userId },
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json(history);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/history — clear all
router.delete('/', async (req, res) => {
  try {
    await History.destroy({ where: { userId: req.userId } });
    res.json({ message: 'History cleared' });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/history/:id — delete single entry
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await History.destroy({ where: { id: req.params.id, userId: req.userId } });
    if (!deleted) return res.status(404).json({ message: 'History entry not found' });
    res.json({ message: 'History entry deleted' });
  } catch (err) {
    console.error('Delete history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
