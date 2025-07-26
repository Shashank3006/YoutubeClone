import mongoose from "mongoose";

// Define the schema for the "Comment" collection
const commentSchema = new mongoose.Schema({
    // Reference to the user who made the comment
    user: { 
        type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId of the user
        ref: "User",                          // References the "User" model
        required: true                        // A comment must have a user
    },

    // Reference to the video on which the comment was made
    video: {
        type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId of the video
        ref: "Video",                         // References the "Video" model
        required: true                        // A comment must be linked to a video
    },

    // The actual text/content of the comment
    text: { 
        type: String,                         // Comment content
        required: true                        // Text is mandatory
    },

    // Optional: timestamp of when the comment was created (default = current time)
    timestamp: { 
        type: Date, 
        default: Date.now                     // Defaults to current date and time
    },
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a Mongoose model from the schema
const CommentModel = mongoose.model("Comment", commentSchema);

// Export the model so it can be used in other parts of the application
export default CommentModel;
