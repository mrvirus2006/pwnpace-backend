// Force Node to use Google DNS to bypass SRV lookup failures
require("node:dns/promises").setServers(["8.8.8.8", "8.8.4.4"]);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json()); 

// --- REQUEST LOGGER (TACTICAL DEBUGGING) ---
// Prints every request to the terminal so you can monitor live traffic
app.use((req, res, next) => {
    // We filter out the health pings so your logs don't get spammed every 5 minutes
    if (req.url !== '/api/health') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
});

// --- Routing Modules ---
// 1. Auth Module (Includes Profile, Password Change, and Delete)
app.use('/api/auth', require('./routes/auth')); 

// 2. Data Pipeline (Unified Progress Tracking)
app.use('/api/logs', require('./routes/logs')); 

// 3. System Configuration (Targets and Date Ranges)
app.use('/api/settings', require('./routes/settings'));

// ---> NEW: UPTIME ROBOT PING ROUTE (STAY AWAKE HACK) <---
app.get('/api/health', (req, res) => {
    res.status(200).send('PwnPace Server is Awake and Operational');
});

// Status Route (Manual Diagnostics)
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "Online", 
        engine: "PwnPace Command Center",
        timestamp: new Date().toISOString()
    });
});

// --- MongoDB Connection Sequence ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[+] SYSTEM SECURED: Connected to MongoDB Atlas');
    
    // Render dynamically assigns a PORT. We listen to that, or fallback to 3000 locally.
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`[+] API ENGINE ONLINE: Port ${PORT}`);
        console.log(`[+] WAITING FOR UPLINK...`);
    });
  })
  .catch((err) => {
    console.error('[-] CRITICAL ERROR: Database Connection Failed');
    console.error(err);
  });