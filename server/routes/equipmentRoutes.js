const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
    addEquipment,
    getAllEquipment,
    getEquipmentByBase,
    updateEquipmentQuantity,
    deleteEquipment
} = require('../controllers/equipmentController');

// 1. Add Equipment: Admin only
router.post('/', verifyToken, authorizeRoles('Admin'), addEquipment);

// 2. Get All Equipment: Admin, LogisticsOfficer, BaseCommander
router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getAllEquipment);

// 3. Get Equipment By Base ID: Admin, LogisticsOfficer, BaseCommander
router.get('/base/:baseId', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getEquipmentByBase);

// 4. Update Equipment Quantity: Admin, LogisticsOfficer
router.put('/:id', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), updateEquipmentQuantity);

// 5. Delete Equipment: Admin only
router.delete('/:id', verifyToken, authorizeRoles('Admin'), deleteEquipment);

module.exports = router;
