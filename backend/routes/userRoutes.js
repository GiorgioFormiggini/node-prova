// Import
const express = require('express');
const router = express.Router();

// Import middleware

// GET /api/user/profile
router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;