const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    getDashboardStats,
    getPurchasesDetail,
    getTransferInDetail,
    getTransferOutDetail
} = require('../controllers/dashboardController');

const allRoles = authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander');

// All dashboard endpoints require login and are role-restricted
router.get('/', verifyToken, allRoles, getDashboardStats);
router.get('/details/purchases', verifyToken, allRoles, getPurchasesDetail);
router.get('/details/transfers-in', verifyToken, allRoles, getTransferInDetail);
router.get('/details/transfers-out', verifyToken, allRoles, getTransferOutDetail);

module.exports = router;
