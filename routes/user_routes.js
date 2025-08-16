const express = require('express');
const router = express.Router();
const user_services = require('../services/user_services');
const { authenticate_token, require_role, require_admin_or_sitemanager } = require('../db/jwt_authorisation');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const result = await user_services.create_user(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    const result = await user_services.login_user(identifier, password);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Verify token
router.get('/verify', authenticate_token, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        decoded: req.decoded
      },
      message: 'Token verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get all users (admin only)
router.get('/', authenticate_token, require_role(['admin', 'sitemanager']), async (req, res) => {
  try {
    const { role } = req.query;
    
    if (role) {
      const result = await user_services.get_users_by_role(role);
      res.status(200).json(result);
    } else {
      const result = await user_services.get_all_users();
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:user_id', authenticate_token, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Users can only access their own profile unless they're admin/sitemanager
    if (req.user.role !== 'admin' && req.user.role !== 'sitemanager' && req.user._id.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await user_services.get_user_by_id(user_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile/me', authenticate_token, async (req, res) => {
  try {
    const result = await user_services.get_user_by_id(req.user._id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Update user by ID
router.put('/:user_id', authenticate_token, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Users can only update their own profile unless they're admin/sitemanager
    if (req.user.role !== 'admin' && req.user.role !== 'sitemanager' && req.user._id.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Regular users cannot change their role
    if (req.user.role !== 'admin' && req.user.role !== 'sitemanager' && req.body.role) {
      delete req.body.role;
    }

    const result = await user_services.update_user(user_id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Update current user profile
router.put('/profile/me', authenticate_token, async (req, res) => {
  try {
    // Regular users cannot change their role
    if (req.user.role !== 'admin' && req.user.role !== 'sitemanager' && req.body.role) {
      delete req.body.role;
    }

    const result = await user_services.update_user(req.user._id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/:user_id/change-password', authenticate_token, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { current_password, new_password } = req.body;
    
    // Users can only change their own password unless they're admin/sitemanager
    if (req.user.role !== 'admin' && req.user.role !== 'sitemanager' && req.user._id.toString() !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const result = await user_services.change_password(user_id, current_password, new_password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Change current user password
router.put('/profile/change-password', authenticate_token, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const result = await user_services.change_password(req.user._id, current_password, new_password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Delete user by ID (admin/sitemanager only)
router.delete('/:user_id', authenticate_token, require_role(['admin', 'sitemanager']), async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await user_services.delete_user(user_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get users by role (admin/sitemanager only)
router.get('/role/:role', authenticate_token, require_role(['admin', 'sitemanager']), async (req, res) => {
  try {
    const { role } = req.params;
    const result = await user_services.get_users_by_role(role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
