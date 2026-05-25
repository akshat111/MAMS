const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.get('/admin', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.status(200).json({
    message: "Welcome Admin! You have full access.",
    user: req.user
  });
});

router.get('/logistics', verifyToken, authorizeRoles('Admin', 'LogisticsOfficer'), (req, res) => {
  res.status(200).json({
    message: "Welcome Logistics Officer! You have access to purchases and transfers.",
    user: req.user
  });
});

router.get('/commander', verifyToken, authorizeRoles('Admin', 'BaseCommander'), (req, res) => {
  res.status(200).json({
    message: "Welcome Base Commander! You have access to related base data.",
    user: req.user
  });
});

module.exports = router;
