const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { createTransfer, getTransfers } = require('../controllers/transferController');

// 1. Create Transfer: Admin & LogisticsOfficer only
router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), createTransfer);

// 2. Get & Filter Transfers: Admin, LogisticsOfficer, BaseCommander
router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getTransfers);

module.exports = router;
