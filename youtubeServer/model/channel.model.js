import mongoose from "mongoose";

// Define the schema for the "Channel" collection
const channelSchema = new mongoose.Schema({
    // Name of the channel (required field)
    channelName: {
        type: String,
        required: true 
    },

    // Optional description of the channel
    description: { 
        type: String 
    },

    // URL or path to the channel's profile picture (optional)
    channelPic: { 
        type: String 
    },

    // URL or path to the channel's banner image (optional)
    channelBanner: { 
        type: String 
    },

    // Reference to the owner of the channel (must be a valid User ID)
    owner: {
        type: mongoose.Schema.Types.ObjectId, // store MongoDB ObjectId
        ref: "User",                          // refers to the User model
        required: true                        // owner is required
    },

    // Number of subscribers the channel has (defaults to 0)
    subscribers: { 
        type: Number, 
        default: 0 
    },

    // Array of video IDs associated with this channel
    videos: [{ 
        type: mongoose.Schema.Types.ObjectId, // store MongoDB ObjectIds
        ref: "Video"                          // refers to the Video model
    }],
}, { 
    timestamps: true // Automatically add `createdAt` and `updatedAt` fields
});

// Create a Mongoose model from the schema
const ChannelModel = mongoose.model("Channel", channelSchema);

// Export the model so it can be used in other parts of the app
export default ChannelModel;
