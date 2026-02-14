// Main API routes file
const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const inventoryRoutes = require('./inventory');
const salesRoutes = require('./sales');
const prescriptionRoutes = require('./prescriptions');
const reportRoutes = require('./reports');

// Route middleware
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.use('/auth', authRoutes);

// Protected routes - require authentication
router.use('/inventory', authenticateToken, inventoryRoutes);
router.use('/sales', authenticateToken, salesRoutes);
router.use('/prescriptions', authenticateToken, prescriptionRoutes);
router.use('/reports', authenticateToken, reportRoutes);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Pharmacy Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      sales: '/api/sales',
      prescriptions: '/api/prescriptions',
      reports: '/api/reports'
    }
  });
});

module.exports = router;