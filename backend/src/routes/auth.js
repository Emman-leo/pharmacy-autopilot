// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/user', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.put('/profile', authController.updateProfile);

module.exports = router;