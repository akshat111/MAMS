const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { createTransfer, getTransfers } = require('../controllers/transferController');

router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), createTransfer);

router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getTransfers);

module.exports = router;
