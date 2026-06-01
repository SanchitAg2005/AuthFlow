const rateLimit = require('express-rate-limit');

exports.authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per 15 minutes
  message: {
    status: 'fail',
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false // Disable the X-RateLimit-* headers
});
