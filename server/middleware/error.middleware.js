const multer = require('multer');
const { ApiResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Resume file size cannot exceed 5 MB',
        data: null,
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  if (
    err.message ===
    'Invalid resume format. Only PDF, DOC and DOCX files are allowed.'
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  if (err.message === 'Resume file is required') {
    return res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid ID format.`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate field value entered: ${field}. Please use another value.`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Failed';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Handler]:', err);
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

const notFoundHandler = (req, res, next) => {
  return ApiResponse.error(res, `Route not found - ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
