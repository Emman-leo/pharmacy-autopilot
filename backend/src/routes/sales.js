// Sales routes
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Sales operations
router.post('/checkout', salesController.checkout);
router.get('/history', salesController.getSalesHistory);
router.get('/receipt/:id', salesController.getReceipt);

module.exports = router;