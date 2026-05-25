const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { addExpenditure, getExpenditureHistory } = require('../controllers/expenditureController');

router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), addExpenditure);

router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getExpenditureHistory);

module.exports = router;
