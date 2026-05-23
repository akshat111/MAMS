const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { addExpenditure, getExpenditureHistory } = require('../controllers/expenditureController');

// 1. Add Expended Asset: Admin & LogisticsOfficer only
router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), addExpenditure);

// 2. Get Expenditure History: Admin, LogisticsOfficer, BaseCommander
router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getExpenditureHistory);

module.exports = router;
