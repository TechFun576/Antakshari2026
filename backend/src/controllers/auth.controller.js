const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/response.util');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_change_me', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return ApiResponse(res, 400, 'Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return ApiResponse(res, 400, 'User already exists');
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      return ApiResponse(res, 201, 'User registered successfully', {
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return ApiResponse(res, 400, 'Invalid user data');
    }
  } catch (error) {
    return ApiResponse(res, 500, error.message);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return ApiResponse(res, 200, 'Login successful', {
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return ApiResponse(res, 401, 'Invalid credentials');
    }
  } catch (error) {
    return ApiResponse(res, 500, error.message);
  }
};
