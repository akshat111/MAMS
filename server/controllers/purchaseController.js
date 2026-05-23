const db = require('../config/db');
const logAction = require('../utils/logger');

const addPurchase = async (req, res) => {
    const { equipment_id, base_id, quantity, purchase_date } = req.body;
    const created_by = req.user.id;

    if (!equipment_id || isNaN(equipment_id) || parseInt(equipment_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Equipment ID is required." });
    }
    if (!base_id || isNaN(base_id) || parseInt(base_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Base ID is required." });
    }
    if (quantity === undefined || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ message: "Purchase quantity must be greater than 0." });
    }

    try {
        const eqCheck = await db.query('SELECT * FROM equipment WHERE id = $1', [equipment_id]);
        if (eqCheck.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found. Cannot purchase." });
        }

        if (eqCheck.rows[0].base_id !== parseInt(base_id)) {
            return res.status(400).json({ message: "Selected equipment does not belong to the specified base." });
        }

        await db.query('BEGIN');

        const purchaseResult = await db.query(
            `INSERT INTO purchases (equipment_id, base_id, quantity, purchase_date, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [equipment_id, base_id, quantity, purchase_date || new Date(), created_by]
        );
        const newPurchase = purchaseResult.rows[0];

        await db.query(
            'UPDATE equipment SET quantity = quantity + $1 WHERE id = $2',
            [quantity, equipment_id]
        );

        await db.query('COMMIT');

        await logAction(
            created_by,
            `Purchased ${quantity} units of equipment ID ${equipment_id} for base ID ${base_id}`
        );

        res.status(201).json({
            message: "Purchase recorded successfully and equipment quantity updated!",
            purchase: newPurchase
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Server error while adding purchase." });
    }
};

const getPurchases = async (req, res) => {
    try {
        let query = `
      SELECT p.*, e.name AS equipment_name, e.type AS equipment_type 
      FROM purchases p 
      JOIN equipment e ON p.equipment_id = e.id
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
            query += ` AND p.base_id = $${idx}`;
        } else if (req.query.base_id) {
            idx++;
            values.push(req.query.base_id);
            query += ` AND p.base_id = $${idx}`;
        }

        if (req.query.date) {
            idx++;
            values.push(req.query.date);
            query += ` AND p.purchase_date = $${idx}`;
        }

        if (req.query.equipment_type) {
            idx++;
            values.push(req.query.equipment_type);
            query += ` AND e.type = $${idx}`;
        }

        query += ` ORDER BY p.purchase_date DESC`;

        const result = await db.query(query, values);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching purchases." });
    }
};

module.exports = {
    addPurchase,
    getPurchases
};
