const config = require('../config/env');
const { ApiResponse } = require('./response');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();

  const isProduction = config.nodeEnv === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  };

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    bio: user.bio,
    title: user.title,
    department: user.department,
    skills: user.skills,
    experienceYears: user.experienceYears,
    resumeUrl: user.resumeUrl,
    createdAt: user.createdAt,
  };

  return res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

module.exports = sendTokenResponse;
