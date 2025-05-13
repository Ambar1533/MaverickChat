// Nodejs API/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    error: true,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

module.exports = { loginRateLimiter };
