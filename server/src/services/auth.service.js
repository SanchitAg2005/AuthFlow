const User = require('../models/user.model');
const { signToken } = require('../utils/token');
const AppError = require('../errors/AppError');

exports.registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email address is already in use', 400, 'BAD_REQUEST');
  }

  // Force 'user' role statically to secure public registration
  const user = await User.create({ name, email, password, role: 'user' });
  const token = signToken(user._id);

  return { user, token };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const token = signToken(user._id);
  return { user, token };
};
