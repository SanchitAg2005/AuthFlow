const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../errors/AppError');
const catchAsync = require('../utils/catchAsync');

exports.authenticateJWT = catchAsync(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401, 'UNAUTHORIZED'));
    }

    req.user = user; // Expose active session context to subsequent controllers
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED'));
  }
});
