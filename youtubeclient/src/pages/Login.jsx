import React, { useState } from 'react'
// Import React and useState hook to manage component state

import { useNavigate } from 'react-router-dom'
// Import useNavigate to programmatically navigate to different routes

import { useAuth } from '../utils/AuthContext.jsx'
// Import custom authentication context hook to access/set the logged-in user

import '../style/registerLogin.css'
// Import CSS for styling the login form

import axios from 'axios'
// Import Axios for making HTTP requests

// Login page component for user authentication
function Login() {
    const { user, setUser } = useAuth(); 
    // Destructure user and setUser from AuthContext

    const navigate = useNavigate(); 
    // Initialize navigate function for redirection

    const [form, setForm] = useState({
        // State to store form inputs for email and password
        email: '',
        password: ''
    });

    // Handle form input changes
    const handleChange = e => {
        setForm({ 
            ...form, // Keep existing values
            [e.target.name]: e.target.value // Update the changed field
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior (page reload)

        try {
            // Send POST request to backend login API
            const { data } = await axios.post(
                "http://localhost:5050/api/user/login", // Backend login endpoint
                form, // Request body (email & password)
                {
                    headers: {
                        "Content-Type": "application/json" // Set content type to JSON
                    }
                }
            );

            // On successful login, save user data from backend
            setUser(data); // Set user context (also triggers localStorage if handled in context)
            navigate("/"); // Redirect user to homepage

        } catch (err) {
            // Catch and log any error (e.g., invalid credentials, network error)
            console.error("❌ Login failed:", err.response?.data?.message || err.message);
            alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
        }
    };

    // Return JSX for login form
    return (
        <div className="auth-container">
            {/* Form for user login */}
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2 className="auth-title">Sign in</h2>

                {/* Email input */}
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder='email'
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                />

                {/* Password input */}
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder='password'
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                />

                {/* Submit button */}
                <button className="auth-btn" type="submit">Login</button>

                {/* Link to registration page */}
                <div className="auth-switch">
                    Don't have an account?{' '}
                    <span className="auth-link" onClick={() => navigate('/register')}>Sign up</span>
                </div>
            </form>
        </div>
    )
}

export default Login;
// Export the Login component for use in routing or other parts of the app
