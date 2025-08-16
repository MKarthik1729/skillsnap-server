const User = require('../schemas/user_schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// JWT secret key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create a new user
const create_user = async (user_data) => {
  try {
    // Check if user already exists with same username or email
    const existing_user = await User.findOne({
      $or: [
        { username: user_data.username },
        { email: user_data.email }
      ],
      deleted_at: null
    });

    if (existing_user) {
      return {
        success: false,
        message: 'User with this username or email already exists'
      };
    }

    // Hash the password
    const salt_rounds = 10;
    const hashed_password = await bcrypt.hash(user_data.password, salt_rounds);

    // Create new user with hashed password
    const new_user = new User({
      ...user_data,
      password: hashed_password
    });

    const saved_user = await new_user.save();

    // Remove password from response
    const user_response = saved_user.toObject();
    delete user_response.password;

    return {
      success: true,
      data: user_response,
      message: 'User created successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create user'
    };
  }
};

// Get all users
const get_all_users = async () => {
  try {
    const users = await User.find({ deleted_at: null })
      .select('-password')
      .sort({ created_at: -1 });
    
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve users'
    };
  }
};

// Get user by ID
const get_user_by_id = async (user_id) => {
  try {
    const user = await User.findOne({ _id: user_id, deleted_at: null })
      .select('-password');
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve user'
    };
  }
};

// Get user by username or email
const get_user_by_username_or_email = async (identifier) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ],
      deleted_at: null
    });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve user'
    };
  }
};

// Update user by ID
const update_user = async (user_id, update_data) => {
  try {
    // If password is being updated, hash it
    if (update_data.password) {
      const salt_rounds = 10;
      update_data.password = await bcrypt.hash(update_data.password, salt_rounds);
    }

    // Check if username or email already exists (excluding current user)
    if (update_data.username || update_data.email) {
      const existing_user = await User.findOne({
        $or: [
          { username: update_data.username },
          { email: update_data.email }
        ],
        _id: { $ne: user_id },
        deleted_at: null
      });

      if (existing_user) {
        return {
          success: false,
          message: 'User with this username or email already exists'
        };
      }
    }

    const updated_user = await User.findOneAndUpdate(
      { _id: user_id, deleted_at: null },
      { ...update_data, updated_at: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updated_user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      data: updated_user,
      message: 'User updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update user'
    };
  }
};

// Delete user by ID (soft delete)
const delete_user = async (user_id) => {
  try {
    const deleted_user = await User.findOneAndUpdate(
      { _id: user_id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    ).select('-password');
    
    if (!deleted_user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      data: deleted_user,
      message: 'User deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete user'
    };
  }
};

// Login user with username/email and password
const login_user = async (identifier, password) => {
  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ],
      deleted_at: null
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Check password
    const is_password_valid = await bcrypt.compare(password, user.password);
    
    if (!is_password_valid) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Generate JWT token
    const token_payload = {
      user_id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(token_payload, JWT_SECRET, { expiresIn: '24h' });

    // Remove password from response
    const user_response = user.toObject();
    delete user_response.password;

    return {
      success: true,
      data: {
        user: user_response,
        token: token
      },
      message: 'Login successful'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to login'
    };
  }
};

// Verify JWT token
const verify_token = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is not deleted
    const user = await User.findOne({ 
      _id: decoded.user_id, 
      deleted_at: null 
    }).select('-password');

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      data: {
        user: user,
        decoded: decoded
      },
      message: 'Token verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Invalid token'
    };
  }
};

// Change password
const change_password = async (user_id, current_password, new_password) => {
  try {
    const user = await User.findOne({ _id: user_id, deleted_at: null });
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify current password
    const is_current_password_valid = await bcrypt.compare(current_password, user.password);
    
    if (!is_current_password_valid) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    // Hash new password
    const salt_rounds = 10;
    const hashed_new_password = await bcrypt.hash(new_password, salt_rounds);

    // Update password
    const updated_user = await User.findOneAndUpdate(
      { _id: user_id },
      { 
        password: hashed_new_password, 
        updated_at: new Date() 
      },
      { new: true }
    ).select('-password');

    return {
      success: true,
      data: updated_user,
      message: 'Password changed successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to change password'
    };
  }
};

// Get users by role
const get_users_by_role = async (role) => {
  try {
    const users = await User.find({ 
      role: role, 
      deleted_at: null 
    })
    .select('-password')
    .sort({ created_at: -1 });
    
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve users'
    };
  }
};

module.exports = {
  create_user,
  get_all_users,
  get_user_by_id,
  get_user_by_username_or_email,
  update_user,
  delete_user,
  login_user,
  verify_token,
  change_password,
  get_users_by_role
};
