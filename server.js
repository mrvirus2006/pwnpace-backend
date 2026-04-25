require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- The Connection Manager ---
// This ensures we reuse the same connection across different users
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return; // Already connected, move on
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log('[+] DATABASE READY');
    } catch (err) {
        console.error('[-] DATABASE ERROR:', err);
    }
};

// --- Middleware to ensure DB is connected for every request ---
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/settings', require('./routes/settings'));

// Status Route (Now it will wait for the DB before answering)
app.get('/api/status', (req, res) => {
    res.json({
        status: "Online",
        engine: "PwnPace Command Center",
        db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        timestamp: new Date().toISOString()
    });
});

module.exports = app;