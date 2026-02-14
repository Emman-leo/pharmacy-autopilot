// Prescriptions routes
const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// Prescription operations
router.post('/', prescriptionController.createPrescription);
router.get('/pending', prescriptionController.getPendingPrescriptions);
router.put('/:id/approve', prescriptionController.approvePrescription);
router.put('/:id/reject', prescriptionController.rejectPrescription);

module.exports = router;