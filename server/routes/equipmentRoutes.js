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

router.post('/', verifyToken, authorizeRoles('Admin'), addEquipment);

router.get('/', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getAllEquipment);

router.get('/base/:baseId', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer', 'BaseCommander'), getEquipmentByBase);

router.put('/:id', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), updateEquipmentQuantity);

router.delete('/:id', verifyToken, authorizeRoles('Admin'), deleteEquipment);

module.exports = router;
