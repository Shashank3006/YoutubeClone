// Controller for user registration, login, and profile APIs

import UserModel from "../model/user.model.js"; // Import the User model
import jwt from "jsonwebtoken"; // JWT for token generation
import bcrypt from "bcrypt"; // bcrypt for hashing passwords

// Helper function to generate a JWT token
const generateToken = (id) => {
    // Sign a JWT token using the user ID and secret, valid for 7 days
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===================== REGISTER =======================

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        // Check if all fields are provided
        if (!username) return res.status(400).json({ message: "Username is required." });
        if (!email) return res.status(400).json({ message: "Email is required." });
        if (!password) return res.status(400).json({ message: "Password is required." });
        if (!avatar) return res.status(400).json({ message: "Avatar is required." });

        // Trim inputs to remove extra spaces
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedAvatar = avatar.trim();

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/;
        if (!passwordRegex.test(trimmedPassword)) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
            });
        }

        // Check if a user with the same email already exists
        const userExists = await UserModel.findOne({ email: trimmedEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password for security
        const hashed = await bcrypt.hash(trimmedPassword, 10);

        // Create and save the new user
        const user = await UserModel.create({
            username: trimmedUsername,
            email: trimmedEmail,
            password: hashed,
            avatar: trimmedAvatar,
        });

        // Return user data along with a JWT token
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            channelId: user.channel ? user.channel.toString() : null,
            token: generateToken(user._id),
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===================== LOGIN =======================

// Login existing user and return token
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ensure email and password are provided
        if (!email) return res.status(400).json({ message: "Email is required." });
        if (!password) return res.status(400).json({ message: "Password is required." });

        // Check if user exists with provided email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare provided password with stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Wrong password" });
        }

        // Return user details and token
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            channelId: user.channel ? user.channel.toString() : null,
            token: generateToken(user._id),
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// ===================== GET PROFILE =======================

// Get logged-in user's profile details
export const getUserProfile = async (req, res) => {
    try {
        // Fetch user by ID, populate related channel if exists
        const user = await UserModel.findById(req.user.id).populate("channel");

        // Respond with selected user data
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            channelId: user.channel ? user.channel._id.toString() : null,
            // Add more fields as needed
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};
