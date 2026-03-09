const express = require('express');
const { User, Collection, Environment, History, Variable, Request } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toSafeJSON());
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    await user.save();

    res.json(user.toSafeJSON());
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/user/account
router.delete('/account', async (req, res) => {
  try {
    await User.destroy({ where: { id: req.userId } });
    // Cascade will handle related data deletion
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
