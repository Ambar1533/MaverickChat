// Nodejs API/middleware/validateRequest.js

const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: true,
      message: errors.array()[0].msg,
    });
  }
  next();
};
