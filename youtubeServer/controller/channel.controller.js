// Controller for channel creation, fetch, update, and delete APIs

import ChannelModel from '../model/channel.model.js';
import UserModel from '../model/user.model.js';

// =======================
// Create a new channel (Protected Route)
// =======================
export const createChannel = async (req, res) => {
  try {
    // Destructure input from the request body
    const { channelName, description, channelPic, channelBanner } = req.body;

    // Create a new channel with the current user as the owner
    const channel = await ChannelModel.create({
      channelName,
      description,
      channelPic,
      channelBanner,
      owner: req.user.id // Comes from protect middleware
    });

    // Update the User model to link the new channel ID to the user
    await UserModel.findByIdAndUpdate(req.user.id, { channel: channel._id });

    // Send response with the channel details, adding `channelId` for frontend consistency
    res.status(201).json({
      ...channel.toObject(), // Spread channel data
      channelId: channel._id.toString() // Add stringified ID for frontend
    });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get a channel by its ID (Public Route)
// =======================
export const getChannelById = async (req, res) => {
  try {
    // Find channel by its MongoDB _id and populate video details
    const channel = await ChannelModel.findById(req.params.id).populate('videos');

    // If no channel found, return 404
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Respond with full channel object and channelId
    res.json({
      ...channel.toObject(),
      channelId: channel._id.toString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Get a channel by the owner's user ID (Public Route)
// =======================
export const getChannelByUser = async (req, res) => {
  try {
    // Find a channel where the owner matches the provided userId
    const channel = await ChannelModel.findOne({ owner: req.params.userId }).populate('videos');

    if (!channel) return res.status(404).json({ message: "Channel not found" });

    // Return channel data and ID
    res.json({
      ...channel.toObject(),
      channelId: channel._id.toString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Update a channel (Protected Route, only by owner)
// =======================
export const updateChannel = async (req, res) => {
  try {
    // Find channel by ID
    const channel = await ChannelModel.findById(req.params.id);

    // Only allow update if channel exists and user is the owner
    if (!channel || channel.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Merge request body into existing channel document
    Object.assign(channel, req.body);

    // Save updated channel to DB
    await channel.save();

    // Return updated channel data
    res.json({
      ...channel.toObject(),
      channelId: channel._id.toString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================
// Delete a channel (Protected Route, only by owner)
// =======================
export const deleteChannel = async (req, res) => {
  try {
    // Find channel by ID
    const channel = await ChannelModel.findById(req.params.id);

    // Allow deletion only if the channel exists and belongs to the logged-in user
    if (!channel || channel.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the channel from the database
    await channel.remove();

    res.json({ message: "Channel deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
