// Nodejs API/middleware/mongoSanitize.js
const mongoSanitize = require('express-mongo-sanitize');

module.exports = mongoSanitize({
  replaceWith: '_', // replace keys with "$" or "." with "_"
});
