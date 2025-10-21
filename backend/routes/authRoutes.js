// import
const express = require('express');
const router = express.Router();

// import controllers
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

module.exports = router; 