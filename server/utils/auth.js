const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || config.jwtSecret;
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId || null,
    },
    secret,
    {
      expiresIn: config.jwtExpiresIn || '7d',
    }
  );
};

const getCookieOptions = () => {
  const isProd = (process.env.NODE_ENV || config.nodeEnv) === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

module.exports = {
  generateToken,
  getCookieOptions,
};
