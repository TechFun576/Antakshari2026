const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/response.util');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      return ApiResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return ApiResponse(res, 401, 'Not authorized, no token');
  }
};

module.exports = { protect };
