const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth'); // Uses our unified middleware
const router = express.Router();

const JWT_SECRET = 'your_super_secret_cyber_key_123!'; 

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    console.log("[1] Register requested for:", req.body.email);
    const { username, email, password } = req.body;

    const user = new User({ username, email, password });
    
    console.log("[2] Saving to MongoDB Atlas...");
    await user.save();
    
    console.log("[3] Save successful.");
    res.status(201).json({ message: 'Agent enrolled successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ error: `Agent ${field} is already registered.` });
    }
    console.error("[-] REGISTRATION ERROR:", error); 
    res.status(400).json({ error: "Enrollment failed." }); 
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    console.log("[1] Login requested for:", req.body.email);
    const { email, password } = req.body;
    
    console.log("[2] Searching database...");
    const user = await User.findOne({ email });
    if (!user) {
        console.log("[-] Agent not found.");
        return res.status(404).json({ error: 'Access Denied: Agent not found.' });
    }

    console.log("[3] Comparing passwords...");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        console.log("[-] Invalid passcode.");
        return res.status(401).json({ error: 'Access Denied: Invalid passcode.' });
    }

    console.log("[4] Generating token...");
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log("[+] Login successful.");
    res.json({ token, message: 'Uplink Established.' });
  } catch (error) {
    console.error("[-] LOGIN ERROR:", error);
    res.status(500).json({ error: 'Server error. Node uplink severed.' });
  }
});

// 3. GET PROFILE
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: "Agent not found." });
    
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Mainframe fetch failed." });
  }
});

// 4. CHANGE PASSWORD
router.post('/change-password', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Agent not found." });

    user.password = password; 
    await user.save();
    
    res.json({ message: "Access Key Rotated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Encryption update failed." });
  }
});

// 5. DELETE ACCOUNT
router.delete('/delete-account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: "Agent record purged from database." });
  } catch (err) {
    res.status(500).json({ error: "Purge sequence failed." });
  }
});

module.exports = router;