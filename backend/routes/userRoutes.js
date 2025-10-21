// Import
const express = require('express');
const router = express.Router();

// Import middleware
const verifyToken = require('./middleware/authMiddleware');
const userController = require('./controller/userController');

// GET /api/user/profile
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;