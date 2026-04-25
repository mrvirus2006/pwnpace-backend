const express = require('express');
const ProgressLog = require('../models/ProgressLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const logs = await ProgressLog.find({ userId: req.user.userId }).sort({ date: 1 }); 
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { date, dailyModules, dailySections, note } = req.body;
    const log = await ProgressLog.findOneAndUpdate(
      { date: date, userId: req.user.userId },
      { $set: { dailyModules, dailySections, note, userId: req.user.userId } },
      { returnDocument: 'after', upsert: true }
    );
    res.status(200).json(log);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save log.' });
  }
});

// --- NEW DELETE ROUTE GOES HERE ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await ProgressLog.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!log) return res.status(404).json({ error: 'Log not found or unauthorized.' });
    res.status(200).json({ message: 'Log eradicated.' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed.' });
  }
});

module.exports = router;