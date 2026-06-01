const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerUser(name, email, password);

  res.status(201).json({
    status: 'success',
    data: {
      token,
      user
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);

  res.status(200).json({
    status: 'success',
    data: {
      token,
      user
    }
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is already attached by authenticateJWT middleware
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});
