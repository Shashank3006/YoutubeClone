// Middleware to protect routes using JWT authentication

import jwt from 'jsonwebtoken';
import UserModel from '../model/user.model.js';

// Middleware function to protect routes
export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization; // Get the Authorization header

    // If no token is found or it doesn't start with 'Bearer ', reject the request
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    // If token is missing after splitting (just in case), reject the request
    if (!token) {
        return res.status(401).json({ message: "No token, unauthorized" });
    }

    try {
        // Verify the token using the secret key from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user based on the ID in the token payload (decoded.id)
        // Exclude password from the result for security
        req.user = await UserModel.findById(decoded.id).select('-password');

        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Token is invalid or expired
        res.status(401).json({ message: "Invalid token" });
    }
};
