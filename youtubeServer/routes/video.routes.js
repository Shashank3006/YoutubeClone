// Import necessary modules
import express from 'express';
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosByChannel,
  deleteVideo,
  likeVideo,
  unlikeVideo,
  dislikeVideo,
  undislikeVideo,
  updateVideo
} from '../controller/video.controller.js'; // Import video controller functions

import { protect } from '../middleware/authMiddleware.js'; // Middleware to protect certain routes

// Create an instance of Express router
const router = express.Router();

/**
 * @route   POST /api/videos
 * @desc    Upload a new video
 * @access  Private (Requires login)
 */
router.post('/', protect, uploadVideo);

/**
 * @route   GET /api/videos
 * @desc    Get all videos
 * @access  Public
 */
router.get('/', getAllVideos);

/**
 * @route   GET /api/videos/:id
 * @desc    Get a single video by ID
 * @access  Public
 */
router.get('/:id', getVideoById);

/**
 * @route   GET /api/videos/channel/:channelId
 * @desc    Get all videos from a specific channel
 * @access  Public
 */
router.get('/channel/:channelId', getVideosByChannel); // Placed after more generic :id to avoid conflict

/**
 * @route   PUT /api/videos/:id
 * @desc    Update video details (title, description, etc.)
 * @access  Private (Only uploader/owner)
 */
router.put('/:id', protect, updateVideo);

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete a video by ID
 * @access  Private (Only uploader/owner)
 */
router.delete('/:id', protect, deleteVideo);

/**
 * @route   PATCH /api/videos/:id/like
 * @desc    Like a video
 * @access  Private
 */
router.patch('/:id/like', protect, likeVideo);

/**
 * @route   PATCH /api/videos/:id/unlike
 * @desc    Remove like from a video
 * @access  Private
 */
router.patch('/:id/unlike', protect, unlikeVideo);

/**
 * @route   PATCH /api/videos/:id/dislike
 * @desc    Dislike a video
 * @access  Private
 */
router.patch('/:id/dislike', protect, dislikeVideo);

/**
 * @route   PATCH /api/videos/:id/undislike
 * @desc    Remove dislike from a video
 * @access  Private
 */
router.patch('/:id/undislike', protect, undislikeVideo);

// Export the router to be used in main server file
export default router;
