const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { ApiError } = require('../utils/response');

const clearStaleCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
};

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError('Not authorized to access this route. Token missing.', 401));
    }

    try {
      const secret = process.env.JWT_SECRET || config.jwtSecret;
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId || decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        clearStaleCookie(res);
        return next(new ApiError('User belonging to this token no longer exists.', 401));
      }

      if (!user.isActive) {
        return next(new ApiError('Your account has been deactivated. Please contact support.', 403));
      }

      req.user = user;
      next();
    } catch (err) {
      clearStaleCookie(res);
      return next(new ApiError('Not authorized to access this route. Invalid or expired token.', 401));
    }
  } catch (error) {
    next(error);
  }
};

const { authorize } = require('./role.middleware');

module.exports = {
  protect,
  authorize,
};
