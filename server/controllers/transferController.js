const db = require('../config/db');
const logAction = require('../utils/logger');

const createTransfer = async (req, res) => {
    const { equipment_id, from_base_id, to_base_id, quantity, transfer_date } = req.body;
    const transferred_by = req.user.id;

    if (!equipment_id || isNaN(equipment_id) || parseInt(equipment_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Equipment ID is required." });
    }
    if (!from_base_id || isNaN(from_base_id) || parseInt(from_base_id) <= 0) {
        return res.status(400).json({ message: "A valid positive source Base ID is required." });
    }
    if (!to_base_id || isNaN(to_base_id) || parseInt(to_base_id) <= 0) {
        return res.status(400).json({ message: "A valid positive destination Base ID is required." });
    }
    if (parseInt(from_base_id) === parseInt(to_base_id)) {
        return res.status(400).json({ message: "Source base and destination base cannot be the same." });
    }
    if (quantity === undefined || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ message: "Transfer quantity must be greater than 0." });
    }

    try {
        const sourceResult = await db.query('SELECT * FROM equipment WHERE id = $1', [equipment_id]);
        if (sourceResult.rows.length === 0) {
            return res.status(404).json({ message: "Source equipment not found." });
        }

        const sourceEquipment = sourceResult.rows[0];

        if (sourceEquipment.base_id !== parseInt(from_base_id)) {
            return res.status(400).json({ message: "Equipment does not belong to the source base specified." });
        }

        if (sourceEquipment.quantity < parseInt(quantity)) {
            return res.status(400).json({ message: "Insufficient stock at source base. Transfer rejected." });
        }

        await db.query('BEGIN');

        await db.query(
            'UPDATE equipment SET quantity = quantity - $1 WHERE id = $2',
            [quantity, equipment_id]
        );

        const destResult = await db.query(
            'SELECT * FROM equipment WHERE name = $1 AND type = $2 AND base_id = $3',
            [sourceEquipment.name, sourceEquipment.type, to_base_id]
        );

        if (destResult.rows.length > 0) {
            await db.query(
                'UPDATE equipment SET quantity = quantity + $1 WHERE id = $2',
                [quantity, destResult.rows[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO equipment (name, type, quantity, base_id) VALUES ($1, $2, $3, $4)',
                [sourceEquipment.name, sourceEquipment.type, quantity, to_base_id]
            );
        }

        const transferResult = await db.query(
            `INSERT INTO transfers (equipment_id, from_base_id, to_base_id, quantity, transfer_date, transferred_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [equipment_id, from_base_id, to_base_id, quantity, transfer_date || new Date(), transferred_by]
        );

        await db.query('COMMIT');

        await logAction(
            transferred_by,
            `Transferred ${quantity} units of ${sourceEquipment.name} (ID: ${equipment_id}) from base ${from_base_id} to base ${to_base_id}`
        );

        res.status(201).json({
            message: "Transfer completed successfully!",
            transfer: transferResult.rows[0]
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Server error during transfer." });
    }
};

const getTransfers = async (req, res) => {
    try {
        let query = `
      SELECT t.*, e.name AS equipment_name, e.type AS equipment_type 
      FROM transfers t
      JOIN equipment e ON t.equipment_id = e.id
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
            query += ` AND (t.from_base_id = $${idx} OR t.to_base_id = $${idx})`;
        } else if (req.query.base_id) {
            idx++;
            values.push(req.query.base_id);
            query += ` AND (t.from_base_id = $${idx} OR t.to_base_id = $${idx})`;
        }

        if (req.query.date) {
            idx++;
            values.push(req.query.date);
            query += ` AND t.transfer_date = $${idx}`;
        }

        if (req.query.equipment_type) {
            idx++;
            values.push(req.query.equipment_type);
            query += ` AND e.type = $${idx}`;
        }

        query += ` ORDER BY t.transfer_date DESC`;

        const result = await db.query(query, values);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching transfers." });
    }
};

module.exports = {
    createTransfer,
    getTransfers
};
