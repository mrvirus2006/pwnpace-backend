const express = require('express');
const UserSettings = require('../models/UserSettings');
const auth = require('../middleware/auth');
const router = express.Router();

// GET CURRENT USER'S SETTINGS (UPGRADED: Collision-Proof)
router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id || req.user._id || req.user.userId;
    
    // THE FIX: Atomic Upsert. It finds or creates in ONE unbreakable step.
    const settings = await UserSettings.findOneAndUpdate(
      { userId: uid },
      { $setOnInsert: { userId: uid } }, // Only applies if creating a brand new document
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json(settings);
  } catch (err) {
    console.error("[-] CRITICAL ERROR FETCHING SETTINGS:", err); 
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// UPDATE CURRENT USER'S SETTINGS
router.post('/', auth, async (req, res) => {
  try {
    const uid = req.user.id || req.user._id || req.user.userId;
    const { currentTarget, totalModules, totalSections, learningRanges } = req.body;
    
    // ---> DEBUG RADAR: Print exactly what Flutter sent us <---
    console.log("[*] INCOMING PAYLOAD FROM FLUTTER:", req.body);

    const settings = await UserSettings.findOneAndUpdate(
      { userId: uid },
      // ---> THE FIX: We explicitly tell Mongoose to OVERWRITE the data <---
      { $set: { currentTarget, totalModules, totalSections, learningRanges } },
      { returnDocument: 'after', upsert: true }
    );
    
    console.log("[+] DATA SUCCESSFULLY SECURED IN ATLAS:", settings);
    res.json(settings);
  } catch (err) {
    console.error("[-] CRITICAL ERROR SAVING SETTINGS:", err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

module.exports = router;