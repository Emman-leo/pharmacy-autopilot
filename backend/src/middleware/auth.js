// Authentication middleware
const jwt = require('jsonwebtoken');
const { sql } = require('../utils/db');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const users = await sql`
      SELECT id, email, full_name, role, created_at
      FROM users 
      WHERE id = ${decoded.userId}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    // Attach user to request object
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication'
    });
  }
};

// Role-based authorization middleware
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorizeRole('admin');

// Staff access middleware (both staff and admin)
const staffOrAdmin = authorizeRole('staff', 'admin');

module.exports = {
  authenticateToken,
  authorizeRole,
  adminOnly,
  staffOrAdmin
};