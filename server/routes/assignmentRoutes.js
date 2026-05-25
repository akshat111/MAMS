const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const { assignEquipment, getAssignmentHistory } = require('../controllers/assignmentController');

router.post('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), assignEquipment);

router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getAssignmentHistory);

module.exports = router;
