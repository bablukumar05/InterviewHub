const { ApiError } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Authentication required before role verification.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role '${req.user.role}' is not authorized to perform this action. Required role: ${roles.join(' or ')}`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
