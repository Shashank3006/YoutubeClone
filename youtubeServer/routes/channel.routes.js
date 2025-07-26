// Importing required modules
import express from 'express';
import {
  createChannel,
  getChannelById,
  getChannelByUser,
  updateChannel,
  deleteChannel
} from '../controller/channel.controller.js'; // Import channel controller functions

import { protect } from '../middleware/authMiddleware.js'; // Middleware to protect routes (authentication check)

// Create a new Express router
const router = express.Router();

/**
 * @route   POST /api/channel/
 * @desc    Create a new channel
 * @access  Private (user must be logged in)
 */
router.post('/', protect, createChannel);

/**
 * @route   GET /api/channel/:id
 * @desc    Get channel details by channel ID
 * @access  Public
 */
router.get('/:id', getChannelById);

/**
 * @route   GET /api/channel/user/:userId
 * @desc    Get channel associated with a specific user
 * @access  Public
 */
router.get('/user/:userId', getChannelByUser);

/**
 * @route   PUT /api/channel/:id
 * @desc    Update channel details
 * @access  Private (only channel owner)
 */
router.put('/:id', protect, updateChannel);

/**
 * @route   DELETE /api/channel/:id
 * @desc    Delete a channel
 * @access  Private (only channel owner)
 */
router.delete('/:id', protect, deleteChannel);

// Export the router so it can be used in app.js or server.js
export default router;
