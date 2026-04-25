const jwt = require('jsonwebtoken');
// IMPORTANT: Use the SAME secret across all files
const JWT_SECRET = 'your_super_secret_cyber_key_123!'; 

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Uplink denied. No token detected.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Standardize on .userId to match your Login route payload
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ error: 'Uplink denied. Token invalid or expired.' });
    }
};