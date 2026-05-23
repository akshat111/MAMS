const db = require('../config/db');
const logAction = require('../utils/logger');

const addEquipment = async (req, res) => {
    const { name, type, quantity, base_id } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: "Equipment name is required." });
    }
    if (!type || !type.trim()) {
        return res.status(400).json({ message: "Equipment type is required." });
    }
    if (quantity !== undefined && (isNaN(quantity) || parseInt(quantity) < 0)) {
        return res.status(400).json({ message: "Quantity must be 0 or a positive number." });
    }
    if (!base_id || isNaN(base_id) || parseInt(base_id) <= 0) {
        return res.status(400).json({ message: "A valid positive Base ID is required." });
    }

    try {
        const result = await db.query(
            'INSERT INTO equipment (name, type, quantity, base_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [name.trim(), type.trim(), quantity || 0, base_id]
        );
        const newEquipment = result.rows[0];

        await logAction(req.user.id, `Added equipment: ${name} (Qty: ${quantity}, Base ID: ${base_id})`);

        res.status(201).json({
            message: "Equipment added successfully!",
            equipment: newEquipment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while adding equipment." });
    }
};

const getAllEquipment = async (req, res) => {
    try {
        let result;

        if (req.user.role === 'BaseCommander') {
            const userResult = await db.query('SELECT base_id FROM users WHERE id = $1', [req.user.id]);
            const base_id = userResult.rows[0]?.base_id;

            if (!base_id) {
                return res.status(403).json({ message: "Access denied. Commander is not assigned to any base." });
            }

            result = await db.query('SELECT * FROM equipment WHERE base_id = $1', [base_id]);
        } else {
            result = await db.query('SELECT * FROM equipment');
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching equipment." });
    }
};

const getEquipmentByBase = async (req, res) => {
    const { baseId } = req.params;
    try {
        if (req.user.role === 'BaseCommander') {
            const userResult = await db.query('SELECT base_id FROM users WHERE id = $1', [req.user.id]);
            const base_id = userResult.rows[0]?.base_id;

            if (parseInt(baseId) !== base_id) {
                return res.status(403).json({ message: "Access denied. You can only view your own base's equipment." });
            }
        }

        const result = await db.query('SELECT * FROM equipment WHERE base_id = $1', [baseId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching base equipment." });
    }
};

const updateEquipmentQuantity = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ message: "Invalid equipment ID." });
    }
    if (quantity === undefined || isNaN(quantity) || parseInt(quantity) < 0) {
        return res.status(400).json({ message: "Quantity must be 0 or a positive number." });
    }

    try {
        const checkExist = await db.query('SELECT * FROM equipment WHERE id = $1', [id]);
        if (checkExist.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found." });
        }

        const oldQuantity = checkExist.rows[0].quantity;

        const result = await db.query(
            'UPDATE equipment SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, id]
        );

        await logAction(
            req.user.id,
            `Updated equipment ID ${id} (${checkExist.rows[0].name}) quantity from ${oldQuantity} to ${quantity}`
        );

        res.status(200).json({
            message: "Equipment quantity updated successfully!",
            equipment: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while updating quantity." });
    }
};

const deleteEquipment = async (req, res) => {
    const { id } = req.params;
    try {
        const checkExist = await db.query('SELECT * FROM equipment WHERE id = $1', [id]);
        if (checkExist.rows.length === 0) {
            return res.status(404).json({ message: "Equipment not found." });
        }

        const eqName = checkExist.rows[0].name;

        await db.query('DELETE FROM equipment WHERE id = $1', [id]);

        await logAction(req.user.id, `Deleted equipment: ${eqName} (ID: ${id})`);

        res.status(200).json({ message: "Equipment deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while deleting equipment." });
    }
};

module.exports = {
    addEquipment,
    getAllEquipment,
    getEquipmentByBase,
    updateEquipmentQuantity,
    deleteEquipment
};
