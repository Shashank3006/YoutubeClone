// Import core packages
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config'; // Load environment variables from .env file

// Import custom route handlers
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import channelRoutes from './routes/channel.routes.js';

// Import custom middleware
import log from './middleware/logger.js';

// Initialize express application
const app = new express();

// Define the port to run the server
const PORT = 5050;

// Start listening on the defined port
app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
});

// Middleware to log each incoming request (timestamp, method, URL)
app.use(log);

// Enable Cross-Origin Resource Sharing (for frontend-backend communication)
app.use(cors());

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Serve static files (e.g., video thumbnails, profile pics) from 'media' directory
app.use('/media', express.static('media'));

// Mount all routes under respective base URLs
app.use('/api/user', userRoutes);      // Routes related to user registration, login, profile
app.use('/api/video', videoRoutes);    // Routes related to video CRUD, like/dislike
app.use('/api/comment', commentRoutes); // Routes related to adding, editing, deleting comments
app.use('/api/channel', channelRoutes); // Routes related to channel creation and updates

// Connect to MongoDB database using credentials from environment variables
mongoose.connect('mongodb+srv://testjava0spring:BdMBUhdvrqHwV1sZ@cluster0.aybiq48.mongodb.net/yut')
  .then(() => console.log('Database connected successfully!'))
  .catch(err => console.log('Database connection failed:', err));
