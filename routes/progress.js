const express = require('express');
const router = express.Router();
const ProgressLog = require('../models/ProgressLog');
const User = require('../models/User');


// ALL routes below this line require a valid JWT Token!
router.use(verifyToken);

// --- PROGRESS TRACKING ROUTES ---

// 1. FETCH ALL LOGS (For the logged-in agent)
router.get('/', async (req, res) => {
  try {
    const entries = await ProgressLog.find({ userId: req.user.userId }).sort({ date: 1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Database uplink failed.' });
  }
});

// 2. ADD OR UPDATE LOG
router.post('/', async (req, res) => {
  try {
    const { date, dailyModules, dailySections, note } = req.body;
    
    // Check if a log for this exact dynamic date already exists
    let log = await ProgressLog.findOne({ userId: req.user.userId, date });

    if (log) {
      log.dailyModules = dailyModules;
      log.dailySections = dailySections;
      log.note = note;
      await log.save();
    } else {
      log = new ProgressLog({ userId: req.user.userId, date, dailyModules, dailySections, note });
      await log.save();
    }
    res.status(201).json({ message: 'Log secured in mainframe.', log });
  } catch (error) {
    res.status(500).json({ error: 'Transmission failed.' });
  }
});

// 3. DELETE LOG
router.delete('/:id', async (req, res) => {
  try {
    await ProgressLog.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Log wiped.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to purge log.' });
  }
});

// --- ACCOUNT MANAGEMENT ROUTES ---

// 4. REQUEST ACCOUNT DELETION
router.post('/request-delete', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { deletionRequested: true });
    res.json({ message: 'Deletion request flagged in the system.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to flag account.' });
  }
});

module.exports = router;