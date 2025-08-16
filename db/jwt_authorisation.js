const user_services = require('../services/user_services');

// Middleware to verify JWT token
const authenticate_token = async (req, res, next) => {
  try {
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Check if it's an API request (has Accept: application/json header)
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }
      // Redirect to login page for web requests
      return res.redirect('/login.html');
    }

    const result = await user_services.verify_token(token);
    if (!result.success) {
      // Check if it's an API request
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json(result);
      }
      // Redirect to login page for web requests
      return res.redirect('/login.html');
    }

    req.user = result.data.user;
    req.decoded = result.data.decoded;
    next();
  } catch (error) {
    // Check if it's an API request
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    // Redirect to login page for web requests
    return res.redirect('/login.html');
  }
};

// Middleware to check if user has required role
const require_role = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Check if it's an API request
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      // Redirect to login page for web requests
      return res.redirect('/login.html');
    }

    if (!roles.includes(req.user.role)) {
      // Check if it's an API request
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }
      // Redirect to login page for web requests
      return res.redirect('/login.html');
    }

    next();
  };
};

// Middleware to check if user is admin or sitemanager
const require_admin_or_sitemanager = (req, res, next) => {
  return require_role(['admin', 'sitemanager'])(req, res, next);
};

// Middleware to check if user is admin only
const require_admin = (req, res, next) => {
  return require_role(['admin'])(req, res, next);
};

// Middleware to check if user is content director or higher
const require_content_director_plus = (req, res, next) => {
  return require_role(['admin', 'sitemanager', 'contentdirector'])(req, res, next);
};

// Middleware to check if user is editor or higher
const require_editor_plus = (req, res, next) => {
  return require_role(['admin', 'sitemanager', 'contentdirector', 'editor'])(req, res, next);
};

// Middleware to check if user is author or higher
const require_author_plus = (req, res, next) => {
  return require_role(['admin', 'sitemanager', 'contentdirector', 'editor', 'author'])(req, res, next);
};

module.exports = {
  authenticate_token,
  require_role,
  require_admin_or_sitemanager,
  require_admin,
  require_content_director_plus,
  require_editor_plus,
  require_author_plus
};
