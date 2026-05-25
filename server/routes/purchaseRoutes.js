const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { addPurchase, getPurchases } = require('../controllers/purchaseController');

router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), addPurchase);

router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getPurchases);

module.exports = router;
