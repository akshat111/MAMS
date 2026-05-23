const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { addPurchase, getPurchases } = require('../controllers/purchaseController');

// 1. Add Purchase: Admin & LogisticsOfficer only
router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), addPurchase);

// 2. Get & Filter Purchases: Admin, LogisticsOfficer, BaseCommander
router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getPurchases);

module.exports = router;
