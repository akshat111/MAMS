const db = require('../config/db');

const logAction = async (userId, action) => {
    try {
        await db.query('INSERT INTO logs (user_id, action) VALUES ($1, $2)', [userId, action]);
    } catch (err) {
        console.error("Logging failed:", err.message);
    }
};

module.exports = logAction;
