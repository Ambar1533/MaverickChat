// Nodejs API/middleware/auth.js

const jwt = require('../utils/jwt');

module.exports = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: true, message: 'Access token required' });
  }

  const payload = jwt.verifyToken(token);

  if (!payload) {
    return res.status(403).json({ error: true, message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
};
