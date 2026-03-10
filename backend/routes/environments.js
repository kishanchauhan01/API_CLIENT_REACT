const express = require('express');
const { Environment, Variable } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /api/environments
router.get('/', async (req, res) => {
  try {
    const environments = await Environment.findAll({
      where: { userId: req.userId },
      include: [{ model: Variable, as: 'variables' }],
      order: [['created_at', 'DESC']],
    });
    res.json(environments);
  } catch (err) {
    console.error('Get environments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/environments
router.post('/', async (req, res) => {
  try {
    const { name, variables } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Environment name is required' });
    }

    const environment = await Environment.create({
      userId: req.userId,
      name: name.trim(),
      active: false,
    });

    // Create variables
    if (variables && variables.length > 0) {
      await Variable.bulkCreate(
        variables.map(v => ({ environmentId: environment.id, key: v.key, value: v.value, secret: v.secret || false }))
      );
    }

    const full = await Environment.findByPk(environment.id, {
      include: [{ model: Variable, as: 'variables' }],
    });
    res.status(201).json(full);
  } catch (err) {
    console.error('Create environment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/environments/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, variables } = req.body;
    const environment = await Environment.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!environment) return res.status(404).json({ message: 'Environment not found' });

    if (name) environment.name = name.trim();
    await environment.save();

    // Replace variables: delete old ones, create new ones
    if (variables !== undefined) {
      await Variable.destroy({ where: { environmentId: environment.id } });
      if (variables.length > 0) {
        await Variable.bulkCreate(
          variables.map(v => ({ environmentId: environment.id, key: v.key, value: v.value, secret: v.secret || false }))
        );
      }
    }

    const full = await Environment.findByPk(environment.id, {
      include: [{ model: Variable, as: 'variables' }],
    });
    res.json(full);
  } catch (err) {
    console.error('Update environment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/environments/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Environment.destroy({ where: { id: req.params.id, userId: req.userId } });
    if (!deleted) return res.status(404).json({ message: 'Environment not found' });
    res.json({ message: 'Environment deleted' });
  } catch (err) {
    console.error('Delete environment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/environments/:id/activate
router.put('/:id/activate', async (req, res) => {
  try {
    // Deactivate all environments for this user
    await Environment.update({ active: false }, { where: { userId: req.userId } });

    // Activate the selected one
    const [updated] = await Environment.update({ active: true }, { where: { id: req.params.id, userId: req.userId } });
    if (!updated) return res.status(404).json({ message: 'Environment not found' });

    // Return all environments
    const environments = await Environment.findAll({
      where: { userId: req.userId },
      include: [{ model: Variable, as: 'variables' }],
      order: [['created_at', 'DESC']],
    });
    res.json(environments);
  } catch (err) {
    console.error('Activate environment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
