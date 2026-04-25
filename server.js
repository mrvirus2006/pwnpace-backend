require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection (Serverless Optimized) ---
// We connect outside the request to keep the connection warm
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if Atlas is slow
})
.then(() => console.log('[+] SYSTEM SECURED: Connected to MongoDB Atlas'))
.catch(err => console.error('[-] DATABASE ERROR:', err));

// --- Routing Modules ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/settings', require('./routes/settings'));

// Status / Health Route
app.get('/api/status', (req, res) => {
    res.json({
        status: "Online",
        engine: "PwnPace Command Center",
        db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        timestamp: new Date().toISOString()
    });
});

// --- IMPORTANT: VERCEL EXECUTION ---
// Do NOT use app.listen() for Vercel. 
// We export the app and Vercel handles the rest.
module.exports = app;

// Fallback for local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Local testing on port ${PORT}`));
}