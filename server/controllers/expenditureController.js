const db = require('../config/db');
const logAction = require('../utils/logger');

const addExpenditure = async (req, res) => {
    const { equipment_id, base_id, quantity, reason, expended_date } = req.body;
    const created_by = req.user.id;

    if (!equipment_id || isNaN(equipment_id) || parseInt(equipment_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Equipment ID is required." });
    }
    if (!base_id || isNaN(base_id) || parseInt(base_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Base ID is required." });
    }
    if (quantity === undefined || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ message: "Quantity expended must be greater than 0." });
    }
    if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Reason for expenditure is required." });
    }

    try {
        const eqResult = await db.query('SELECT * FROM equipment WHERE id = $1', [equipment_id]);
        if (eqResult.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found." });
        }

        const equipment = eqResult.rows[0];

        if (equipment.base_id !== parseInt(base_id)) {
            return res.status(400).json({ message: "Equipment does not belong to this base." });
        }

        if (equipment.quantity < parseInt(quantity)) {
            return res.status(400).json({ message: "Insufficient stock available to expend." });
        }

        await db.query('BEGIN');

        await db.query(
            'UPDATE equipment SET quantity = quantity - $1 WHERE id = $2',
            [quantity, equipment_id]
        );

        const expResult = await db.query(
            `INSERT INTO expenditures (equipment_id, base_id, quantity, reason, expended_date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [equipment_id, base_id, quantity, reason, expended_date || new Date(), created_by]
        );

        await db.query('COMMIT');

        await logAction(
            created_by,
            `Expended ${quantity} units of ${equipment.name} at base ID ${base_id} due to: ${reason}`
        );

        res.status(201).json({
            message: "Asset expenditure recorded successfully!",
            expenditure: expResult.rows[0]
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Server error during expenditure." });
    }
};

const getExpenditureHistory = async (req, res) => {
    try {
        let query = `
      SELECT ex.*, e.name AS equipment_name, e.type AS equipment_type 
      FROM expenditures ex
      JOIN equipment e ON ex.equipment_id = e.id
      WHERE 1=1
    `;
        const values = [];
        let idx = 0;

        if (req.user.role === 'BaseCommander') {
            const userResult = await db.query('SELECT base_id FROM users WHERE id = $1', [req.user.id]);
            const userBaseId = userResult.rows[0]?.base_id;

            if (!userBaseId) {
                return res.status(403).json({ message: "Access denied. Commander is not assigned to any base." });
            }

            idx++;
            values.push(userBaseId);
            query += ` AND ex.base_id = $${idx}`;
        } else if (req.query.base_id) {
            idx++;
            values.push(req.query.base_id);
            query += ` AND ex.base_id = $${idx}`;
        }

        query += ` ORDER BY ex.expended_date DESC`;

        const result = await db.query(query, values);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching expenditures." });
    }
};

module.exports = {
    addExpenditure,
    getExpenditureHistory
};
