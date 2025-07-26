// Controller for adding, fetching, editing, and deleting comments

import CommentModel from '../model/comment.model.js';
import VideoModel from '../model/video.model.js';

// ================================
// Add a new comment to a video (Protected Route)
// ================================
export const addComment = async (req, res) => {
  try {
    const { text, videoId } = req.body;

    // Create a new comment document
    const comment = await CommentModel.create({
      user: req.user.id, // ID of the logged-in user (from protect middleware)
      video: videoId,    // The video this comment belongs to
      text
    });

    // Push the comment ID into the video's `comments` array
    await VideoModel.findByIdAndUpdate(videoId, {
      $push: { comments: comment._id }
    });

    // Return the created comment as the response
    res.status(201).json(comment);
  } catch (err) {
    // Handle errors (e.g., invalid videoId)
    res.status(500).json({ message: err.message });
  }
};

// ===================================
// Get all comments for a specific video (Public Route)
// ===================================
export const getCommentsByVideo = async (req, res) => {
  try {
    // Find all comments where the video matches req.params.videoId
    // Populate 'user' field with username and avatar only
    const comments = await CommentModel.find({ video: req.params.videoId })
      .populate('user', 'username avatar');

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================================
// Delete a comment (Protected Route, only comment owner)
// ===================================
export const deleteComment = async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Ensure the logged-in user is the comment owner
    if (!comment.user || !comment.user.equals(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the comment reference from the video document
    await VideoModel.findByIdAndUpdate(comment.video, {
      $pull: { comments: comment._id }
    });

    // Permanently delete the comment from the DB
    await CommentModel.findByIdAndDelete(comment._id);

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================================
// Edit a comment (Protected Route, only comment owner)
// ===================================
export const editComment = async (req, res) => {
  try {
    const comment = await CommentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Ensure the logged-in user is the comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update the comment text
    comment.text = req.body.text;

    // Save the updated comment
    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
