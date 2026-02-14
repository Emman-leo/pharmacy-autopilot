// Reports routes
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Report endpoints
router.get('/sales-summary', reportController.getSalesSummary);
router.get('/top-selling', reportController.getTopSelling);
router.get('/expiry-alerts', reportController.getExpiryAlerts);

module.exports = router;