// Inventory routes
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Drug management
router.get('/drugs', inventoryController.getDrugs);
router.post('/drugs', inventoryController.createDrug);
router.put('/drugs/:id', inventoryController.updateDrug);
router.delete('/drugs/:id', inventoryController.deleteDrug);

// Batch management
router.get('/batches', inventoryController.getBatches);
router.post('/batches', inventoryController.addBatch);
router.put('/batches/:id', inventoryController.updateBatch);
router.delete('/batches/:id', inventoryController.deleteBatch);

// Alerts
router.get('/alerts', inventoryController.getAlerts);

module.exports = router;