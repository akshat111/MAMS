const db = require('../config/db');

const getBaseIdForCommander = async (userId) => {
    const userResult = await db.query('SELECT base_id FROM users WHERE id = $1', [userId]);
    return userResult.rows[0]?.base_id || null;
};

const getDashboardStats = async (req, res) => {
    const { date, base, equipment_type } = req.query;
    let targetBaseId = base;

    try {
        if (req.user.role === 'BaseCommander') {
            const commanderBaseId = await getBaseIdForCommander(req.user.id);
            if (!commanderBaseId) {
                return res.status(403).json({ message: "Access denied. Commander has no base assigned." });
            }
            targetBaseId = commanderBaseId;
        }

        let stockQuery = `SELECT COALESCE(SUM(quantity), 0) AS total_stock FROM equipment e WHERE 1=1`;
        const stockParams = [];
        if (targetBaseId) {
            stockParams.push(targetBaseId);
            stockQuery += ` AND e.base_id = $1`;
        }
        if (equipment_type) {
            stockParams.push(equipment_type);
            stockQuery += targetBaseId ? ` AND e.type = $2` : ` AND e.type = $1`;
        }
        const stockRes = await db.query(stockQuery, stockParams);
        const closingBalance = parseInt(stockRes.rows[0].total_stock);

        let pQuery = `SELECT COALESCE(SUM(p.quantity), 0) AS total FROM purchases p JOIN equipment e ON p.equipment_id = e.id WHERE 1=1`;
        const pValues = [];
        let pCount = 0;
        if (targetBaseId) { pCount++; pValues.push(targetBaseId); pQuery += ` AND p.base_id = $${pCount}`; }
        if (date) { pCount++; pValues.push(date); pQuery += ` AND p.purchase_date = $${pCount}`; }
        if (equipment_type) { pCount++; pValues.push(equipment_type); pQuery += ` AND e.type = $${pCount}`; }
        const purchasesRes = await db.query(pQuery, pValues);
        const purchases = parseInt(purchasesRes.rows[0].total);

        let tInQuery = `SELECT COALESCE(SUM(t.quantity), 0) AS total FROM transfers t JOIN equipment e ON t.equipment_id = e.id WHERE 1=1`;
        const tInValues = [];
        let tInCount = 0;
        if (targetBaseId) { tInCount++; tInValues.push(targetBaseId); tInQuery += ` AND t.to_base_id = $${tInCount}`; }
        if (date) { tInCount++; tInValues.push(date); tInQuery += ` AND t.transfer_date = $${tInCount}`; }
        if (equipment_type) { tInCount++; tInValues.push(equipment_type); tInQuery += ` AND e.type = $${tInCount}`; }
        const tInRes = await db.query(tInQuery, tInValues);
        const transferIn = parseInt(tInRes.rows[0].total);

        let tOutQuery = `SELECT COALESCE(SUM(t.quantity), 0) AS total FROM transfers t JOIN equipment e ON t.equipment_id = e.id WHERE 1=1`;
        const tOutValues = [];
        let tOutCount = 0;
        if (targetBaseId) { tOutCount++; tOutValues.push(targetBaseId); tOutQuery += ` AND t.from_base_id = $${tOutCount}`; }
        if (date) { tOutCount++; tOutValues.push(date); tOutQuery += ` AND t.transfer_date = $${tOutCount}`; }
        if (equipment_type) { tOutCount++; tOutValues.push(equipment_type); tOutQuery += ` AND e.type = $${tOutCount}`; }
        const tOutRes = await db.query(tOutQuery, tOutValues);
        const transferOut = parseInt(tOutRes.rows[0].total);

        let aQuery = `SELECT COALESCE(SUM(a.quantity), 0) AS total FROM assignments a JOIN equipment e ON a.equipment_id = e.id WHERE 1=1`;
        const aValues = [];
        let aCount = 0;
        if (targetBaseId) { aCount++; aValues.push(targetBaseId); aQuery += ` AND a.base_id = $${aCount}`; }
        if (date) { aCount++; aValues.push(date); aQuery += ` AND a.assigned_date = $${aCount}`; }
        if (equipment_type) { aCount++; aValues.push(equipment_type); aQuery += ` AND e.type = $${aCount}`; }
        const assignedRes = await db.query(aQuery, aValues);
        const assigned = parseInt(assignedRes.rows[0].total);

        let exQuery = `SELECT COALESCE(SUM(ex.quantity), 0) AS total FROM expenditures ex JOIN equipment e ON ex.equipment_id = e.id WHERE 1=1`;
        const exValues = [];
        let exCount = 0;
        if (targetBaseId) { exCount++; exValues.push(targetBaseId); exQuery += ` AND ex.base_id = $${exCount}`; }
        if (date) { exCount++; exValues.push(date); exQuery += ` AND ex.expended_date = $${exCount}`; }
        if (equipment_type) { exCount++; exValues.push(equipment_type); exQuery += ` AND e.type = $${exCount}`; }
        const expendedRes = await db.query(exQuery, exValues);
        const expended = parseInt(expendedRes.rows[0].total);

        const netMovement = purchases + transferIn - transferOut;
        const openingBalance = closingBalance - netMovement + assigned + expended;

        res.status(200).json({ openingBalance, closingBalance, netMovement, purchases, transferIn, transferOut, assigned, expended });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching dashboard stats." });
    }
};

const getPurchasesDetail = async (req, res) => {
    const { date, base, equipment_type } = req.query;
    let targetBaseId = base;
    try {
        if (req.user.role === 'BaseCommander') {
            targetBaseId = await getBaseIdForCommander(req.user.id);
        }
        let query = `SELECT p.*, e.name AS equipment_name, e.type AS equipment_type FROM purchases p JOIN equipment e ON p.equipment_id = e.id WHERE 1=1`;
        const vals = [];
        let v = 0;
        if (targetBaseId) { v++; vals.push(targetBaseId); query += ` AND p.base_id = $${v}`; }
        if (date) { v++; vals.push(date); query += ` AND p.purchase_date = $${v}`; }
        if (equipment_type) { v++; vals.push(equipment_type); query += ` AND e.type = $${v}`; }
        const result = await db.query(query, vals);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTransferInDetail = async (req, res) => {
    const { date, base, equipment_type } = req.query;
    let targetBaseId = base;
    try {
        if (req.user.role === 'BaseCommander') {
            targetBaseId = await getBaseIdForCommander(req.user.id);
        }
        let query = `SELECT t.*, e.name AS equipment_name, e.type AS equipment_type FROM transfers t JOIN equipment e ON t.equipment_id = e.id WHERE 1=1`;
        const vals = [];
        let v = 0;
        if (targetBaseId) { v++; vals.push(targetBaseId); query += ` AND t.to_base_id = $${v}`; }
        if (date) { v++; vals.push(date); query += ` AND t.transfer_date = $${v}`; }
        if (equipment_type) { v++; vals.push(equipment_type); query += ` AND e.type = $${v}`; }
        const result = await db.query(query, vals);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTransferOutDetail = async (req, res) => {
    const { date, base, equipment_type } = req.query;
    let targetBaseId = base;
    try {
        if (req.user.role === 'BaseCommander') {
            targetBaseId = await getBaseIdForCommander(req.user.id);
        }
        let query = `SELECT t.*, e.name AS equipment_name, e.type AS equipment_type FROM transfers t JOIN equipment e ON t.equipment_id = e.id WHERE 1=1`;
        const vals = [];
        let v = 0;
        if (targetBaseId) { v++; vals.push(targetBaseId); query += ` AND t.from_base_id = $${v}`; }
        if (date) { v++; vals.push(date); query += ` AND t.transfer_date = $${v}`; }
        if (equipment_type) { v++; vals.push(equipment_type); query += ` AND e.type = $${v}`; }
        const result = await db.query(query, vals);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getPurchasesDetail,
    getTransferInDetail,
    getTransferOutDetail
};