// middleware/errorHandler.js
'use strict';

module.exports = (err, req, res, next) => {
  console.error(`[🔥 Error] ${err.name}: ${err.message}`);

  // Handle express-validator validation errors
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: true,
      message: 'Validation failed',
      details: err.array(),
    });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
};
