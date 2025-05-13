// Nodejs API/utils/jwt.js

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

exports.generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};
