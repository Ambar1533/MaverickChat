// Nodejs API/validators/authValidator.js

const { check } = require('express-validator');

exports.validateRegister = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),

  check('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
];

exports.validateLogin = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.'),

  check('password')
    .notEmpty().withMessage('Password is required.'),
];
