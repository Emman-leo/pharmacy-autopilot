// Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../utils/db');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user (admin only)
const register = async (req, res) => {
  try {
    const { email, password, fullName, role = 'staff' } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // In a real implementation, this would integrate with Supabase Auth
    // For now, we'll simulate the process
    const newUser = {
      email,
      password: hashedPassword,
      fullName,
      role
    };

    // Note: In production, use Supabase Auth.signUp() instead
    // This is a simplified version for demonstration
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // In a real implementation, this would use Supabase Auth.signInWithPassword()
    // For now, we'll simulate authentication against our users table
    
    // Get user from database
    const users = await sql`
      SELECT id, email, full_name, role, created_at
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Note: In production with Supabase Auth, password validation happens there
    // This is a simplified version for demonstration purposes

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: 'Internal server error'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // In a real implementation with Supabase Auth, you would invalidate the session
    // For now, we'll just return success as JWT tokens are stateless
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error during logout'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.id;

    if (!fullName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name is required'
      });
    }

    // Update user profile
    const updatedUsers = await sql`
      UPDATE users 
      SET full_name = ${fullName}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, full_name, role, created_at, updated_at
    `;

    if (updatedUsers.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUsers[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error during profile update'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile
};