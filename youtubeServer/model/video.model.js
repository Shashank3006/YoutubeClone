import mongoose from "mongoose";

// Define the schema for the "Video" collection
const videoSchema = new mongoose.Schema({
    // Title of the video (required)
    title: { 
        type: String, 
        required: true 
    },

    // Description of the video (optional)
    description: { 
        type: String 
    },

    // Link to the actual video file or streaming URL (required)
    videoLink: { 
        type: String, 
        required: true 
    },

    // Link to the thumbnail image for the video (optional)
    thumbnail: { 
        type: String 
    },

    // Number of times the video has been viewed (default is 0)
    views: { 
        type: Number, 
        default: 0 
    },

    // Number of likes the video has received (default is 0)
    likes: { 
        type: Number, 
        default: 0 
    },

    // Number of dislikes the video has received (default is 0)
    dislikes: { 
        type: Number, 
        default: 0 
    },

    // Array of user IDs who liked the video (helps prevent duplicate likes)
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId, // references User model
        ref: "User"
    }],

    // Array of user IDs who disliked the video (helps prevent duplicate dislikes)
    dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId, // references User model
        ref: "User"
    }],

    // The date the video was uploaded (defaults to current date/time)
    uploadDate: { 
        type: Date, 
        default: Date.now 
    },

    // Category or genre of the video (optional, e.g., "Education", "Comedy")
    category: { 
        type: String 
    },

    // The channel that uploaded the video (required)
    channel: {
        type: mongoose.Schema.Types.ObjectId, // references Channel model
        ref: "Channel",
        required: true
    },

    // Array of comments (each comment references a Comment model)
    comments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Comment" 
    }]
}, { 
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create a Mongoose model based on the schema
const VideoModel = mongoose.model("Video", videoSchema);

// Export the model so it can be imported and used elsewhere
export default VideoModel;
