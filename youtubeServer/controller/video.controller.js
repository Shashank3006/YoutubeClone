// Controller for video upload, fetch, update, like/dislike, and delete APIs

import VideoModel from '../model/video.model.js';
import ChannelModel from '../model/channel.model.js';
import UserModel from '../model/user.model.js';

/**
 * Upload a new video by the logged-in user's channel
 */
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, videoLink, thumbnail, category } = req.body;

    // Find the channel of the logged-in user
    const channel = await ChannelModel.findOne({ owner: req.user.id });

    // Create a new video document and associate it with the channel
    const video = await VideoModel.create({
      title,
      description,
      videoLink,
      thumbnail,
      category,
      channel: channel._id
    });

    // Push video reference into the channel's videos array
    channel.videos.push(video._id);
    await channel.save();

    res.status(201).json(video); // Return the created video
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all videos (public access)
 */
export const getAllVideos = async (req, res) => {
  try {
    // Populate the channel details for each video
    const videos = await VideoModel.find().populate('channel');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get video details by ID (public)
 */
export const getVideoById = async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id)
      .populate('channel') // Include channel details
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username avatar' } // Include commenter info
      });

    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all videos for a specific channel (public)
 */
export const getVideosByChannel = async (req, res) => {
  try {
    const videos = await VideoModel.find({ channel: req.params.channelId });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a video (only the channel owner can delete)
 */
export const deleteVideo = async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const channel = await ChannelModel.findById(video.channel);
    
    // Check if logged-in user is the owner of the channel
    if (channel.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    // Delete video and remove its reference from channel
    await VideoModel.findByIdAndDelete(video._id);
    await ChannelModel.findByIdAndUpdate(channel._id, {
      $pull: { videos: video._id }
    });

    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Like a video (only logged-in users)
 */
export const likeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const video = await VideoModel.findById(req.params.id);
    const user = await UserModel.findById(userId);

    if (!video || !user) return res.status(404).json({ message: "Video or user not found" });

    // If already liked, skip
    if (video.likedBy.includes(userId)) {
      return res.json({ likes: video.likes, dislikes: video.dislikes });
    }

    // If disliked before, remove dislike
    if (video.dislikedBy.includes(userId)) {
      video.dislikedBy.pull(userId);
      video.dislikes = Math.max(0, video.dislikes - 1);
    }

    // Add like and update counts
    video.likedBy.push(userId);
    video.likes += 1;

    // Store liked video in user's likedVideos list
    if (!user.likedVideos) user.likedVideos = [];
    if (!user.likedVideos.includes(video._id)) {
      user.likedVideos.push(video._id);
    }

    await video.save();
    await user.save();

    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Unlike a video (remove like)
 */
export const unlikeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const video = await VideoModel.findById(req.params.id);
    const user = await UserModel.findById(userId);

    if (!video || !user) return res.status(404).json({ message: "Video or user not found" });

    // Remove like and decrement count
    if (video.likedBy.includes(userId)) {
      video.likedBy.pull(userId);
      video.likes = Math.max(0, video.likes - 1);
    }

    // Remove from user's likedVideos
    if (user.likedVideos && user.likedVideos.includes(video._id)) {
      user.likedVideos.pull(video._id);
    }

    await video.save();
    await user.save();

    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Dislike a video (only logged-in users)
 */
export const dislikeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const video = await VideoModel.findById(req.params.id);
    const user = await UserModel.findById(userId);

    if (!video || !user) return res.status(404).json({ message: "Video or user not found" });

    // If already disliked, skip
    if (video.dislikedBy.includes(userId)) {
      return res.json({ likes: video.likes, dislikes: video.dislikes });
    }

    // Remove like if present
    if (video.likedBy.includes(userId)) {
      video.likedBy.pull(userId);
      video.likes = Math.max(0, video.likes - 1);

      // Also remove from user's liked videos
      if (user.likedVideos && user.likedVideos.includes(video._id)) {
        user.likedVideos.pull(video._id);
      }
    }

    // Add dislike
    video.dislikedBy.push(userId);
    video.dislikes += 1;

    await video.save();
    await user.save();

    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Undo dislike on a video
 */
export const undislikeVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    const video = await VideoModel.findById(req.params.id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    // Remove user's dislike and update count
    if (video.dislikedBy.includes(userId)) {
      video.dislikedBy.pull(userId);
      video.dislikes = Math.max(0, video.dislikes - 1);
    }

    await video.save();

    res.json({ likes: video.likes, dislikes: video.dislikes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update video details (only the owner of the channel can update)
 */
export const updateVideo = async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Check if user owns the channel associated with the video
    const channel = await ChannelModel.findById(video.channel);
    if (!channel || channel.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update allowed fields if present in request body
    const fields = ["title", "description", "videoLink", "thumbnail", "category"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) video[field] = req.body[field];
    });

    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
