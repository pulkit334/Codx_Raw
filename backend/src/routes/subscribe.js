const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// Get subscriber count (public)
router.get('/count', async (req, res) => {
  try {
    const count = await Subscriber.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    res.json({ success: true, count: 0 });
  }
});

// Manual increment (for tracking Google Form submissions via webhook or admin)
router.post('/increment', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email required' });
    }
    const exists = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.json({ success: true, message: 'Already counted' });
    }
    await Subscriber.create({ email: email.toLowerCase().trim(), ipAddress: req.ip || '' });
    const count = await Subscriber.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
