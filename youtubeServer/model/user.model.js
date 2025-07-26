import mongoose from "mongoose";

// Define the schema for the "User" collection
const userSchema = new mongoose.Schema({
    // Unique username for the user
    username: {
        type: String,
        required: true
    },

    // User's email address (must be unique)
    email: {
        type: String,
        required: true,
        unique: true // Ensures no two users have the same email
    },

    // Hashed password (required for authentication)
    password: {
        type: String,
        required: true
    },

    // Optional: URL or path to the user's avatar/profile picture
    avatar: {
        type: String 
    },

    // Array of videos liked by the user (store video _id references)
    likedVideos: [{
        type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
        ref: 'Video'                          // References the "Video" model
    }],

    // Array of channels the user has subscribed to
    subscribedChannels: [{ 
        type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
        ref: 'Channel'                        // References the "Channel" model
    }],

    // Optional reference to the user's own channel (if they created one)
    channel: { 
        type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
        ref: 'Channel',
        default: null                         // If not a creator, leave as null
    }
}, { 
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Create a Mongoose model from the schema
const UserModel = mongoose.model("User", userSchema);

// Export the model so it can be used elsewhere in the application
export default UserModel;
