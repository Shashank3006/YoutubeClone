// Import necessary modules
import express from 'express';
import {
  addComment,
  getCommentsByVideo,
  deleteComment,
  editComment
} from '../controller/comment.controller.js'; // Import comment controller functions

import { protect } from '../middleware/authMiddleware.js'; // Middleware to protect routes (authentication)

// Create an Express router
const router = express.Router();

/**
 * @route   POST /api/comment/
 * @desc    Add a new comment to a video
 * @access  Private (only logged-in users can comment)
 */
router.post('/', protect, addComment);

/**
 * @route   GET /api/comment/:videoId
 * @desc    Get all comments for a specific video
 * @access  Public
 */
router.get('/:videoId', getCommentsByVideo);

/**
 * @route   DELETE /api/comment/:id
 * @desc    Delete a comment by its ID
 * @access  Private (only the comment's owner can delete it)
 */
router.delete('/:id', protect, deleteComment);

/**
 * @route   PATCH /api/comment/:id
 * @desc    Edit a comment by its ID
 * @access  Private (only the comment's owner can edit it)
 */
router.patch('/:id', protect, editComment);

// Export the router to be used in the main server/app file
export default router;
