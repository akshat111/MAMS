const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { assignEquipment, getAssignmentHistory } = require('../controllers/assignmentController');

// 1. Assign Equipment: Admin & LogisticsOfficer only
router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), assignEquipment);

// 2. Get Assignment History: Admin, LogisticsOfficer, BaseCommander
router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getAssignmentHistory);

module.exports = router;
