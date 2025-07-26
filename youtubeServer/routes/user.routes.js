// Import necessary modules
import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile
} from '../controller/user.controller.js'; // Import user controller functions

import { protect } from '../middleware/authMiddleware.js'; // Middleware to protect routes (requires authentication)

// Initialize an Express router
const router = express.Router();

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 * @body    { username, email, password, avatar }
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/user/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/user/profile
 * @desc    Get currently logged-in user's profile
 * @access  Private (requires valid JWT token)
 */
router.get('/profile', protect, getUserProfile);

// Export router to be used in app.js or index.js
export default router;
