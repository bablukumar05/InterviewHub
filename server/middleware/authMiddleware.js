const jwt = require('jsonwebtoken');
const config = require('../config/env');

const protect = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null,
      });
    }

    const secret = process.env.JWT_SECRET || config.jwtSecret;
    const decoded = jwt.verify(token, secret);

    req.user = {
      userId: decoded.userId || decoded.id,
      id: decoded.userId || decoded.id,
      role: decoded.role,
      organizationId: decoded.organizationId || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      data: null,
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        data: null,
      });
    }

    next();
  };
};

const optionalAuth = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const secret = process.env.JWT_SECRET || config.jwtSecret;
      const decoded = jwt.verify(token, secret);
      req.user = {
        userId: decoded.userId || decoded.id,
        id: decoded.userId || decoded.id,
        role: decoded.role,
        organizationId: decoded.organizationId || null,
      };
    }
  } catch (error) {}

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
