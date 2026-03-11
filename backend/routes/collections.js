const express = require('express');
const { Collection, Request } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /api/collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { userId: req.userId },
      include: [{ model: Request, as: 'requests' }],
      order: [['created_at', 'DESC']],
    });
    res.json(collections);
  } catch (err) {
    console.error('Get collections error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/collections
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const collection = await Collection.create({
      userId: req.userId,
      name: name.trim(),
      description: description?.trim() || '',
    });

    // Return with empty requests array
    const full = await Collection.findByPk(collection.id, {
      include: [{ model: Request, as: 'requests' }],
    });
    res.status(201).json(full);
  } catch (err) {
    console.error('Create collection error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/collections/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const collection = await Collection.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description.trim();
    await collection.save();

    const full = await Collection.findByPk(collection.id, {
      include: [{ model: Request, as: 'requests' }],
    });
    res.json(full);
  } catch (err) {
    console.error('Update collection error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/collections/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Collection.destroy({ where: { id: req.params.id, userId: req.userId } });
    if (!deleted) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    console.error('Delete collection error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/collections/:id/requests
router.post('/:id/requests', async (req, res) => {
  try {
    const { name, method, url } = req.body;
    if (!name) return res.status(400).json({ message: 'Request name is required' });

    const collection = await Collection.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    await Request.create({
      collectionId: collection.id,
      name,
      method: method || 'GET',
      url: url || '',
    });

    const full = await Collection.findByPk(collection.id, {
      include: [{ model: Request, as: 'requests' }],
    });
    res.status(201).json(full);
  } catch (err) {
    console.error('Add request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/collections/:id/requests/:reqId
router.delete('/:id/requests/:reqId', async (req, res) => {
  try {
    const collection = await Collection.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    await Request.destroy({ where: { id: req.params.reqId, collectionId: collection.id } });

    const full = await Collection.findByPk(collection.id, {
      include: [{ model: Request, as: 'requests' }],
    });
    res.json(full);
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
