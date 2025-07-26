// Import React and useState hook from React
import React, { useState } from 'react'

// Import CSS styling specific to this component
import '../style/createChannel.css'

// Import axios for making HTTP requests
import axios from 'axios'

// Import custom authentication context to access current user
import { useAuth } from '../utils/AuthContext.jsx'

// Import navigation hook from React Router
import { useNavigate } from 'react-router-dom'


// Functional component for creating a new channel
function CreateChannel() {

    // Local state to manage form fields: channel name, description, picture, and banner
    const [form, setForm] = useState({
        channelName: '',
        description: '',
        channelPic: '',
        channelBanner: ''
    });

    // Get current logged-in user and setter from AuthContext
    const { user, setUser } = useAuth();

    // Hook to programmatically navigate between routes
    const navigate = useNavigate();

    // Boolean state to indicate loading/submitting state
    const [loading, setLoading] = useState(false);

    // Function to handle changes in form input fields
    const handleChange = e => {
        // Spread previous form state and update the changed input's value
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Function to handle form submission
    const handleSubmit = async e => {
        // Prevent default form reload behavior
        e.preventDefault();

        // If user is not logged in, show an alert and return early
        if (!user) {
            alert("You must be logged in to create a channel.");
            return;
        }

        // Trim input values to remove extra whitespace
        const trimmed = {
            channelName: form.channelName.trim(),
            description: form.description.trim(),
            channelPic: form.channelPic.trim(),
            channelBanner: form.channelBanner.trim()
        };

        // Validate that channel name is not empty
        if (!trimmed.channelName) {
            alert("Channel name is required.");
            return;
        }

        // Set loading to true to disable form and show feedback
        setLoading(true);

        try {
            // Send POST request to API with trimmed data and authorization header
            const { data } = await axios.post(
                "http://localhost:5050/api/channel", // API endpoint
                trimmed, // Form data
                {
                    headers: {
                        Authorization: `Bearer ${user.token}` // Pass JWT token in header
                    }
                }
            );

            // After success, update user context with new channelId (or _id as fallback)
            setUser({ ...user, channelId: data.channelId || data._id });

            // Notify user of success
            alert("Channel created!");

            // Redirect user to their channel page
            navigate("/channel");

        } catch (err) {
            // If an error occurs, show error message from server or fallback to error object
            alert("Failed to create channel: " + (err.response?.data?.message || err.message));
        } finally {
            // In all cases, reset loading state to false
            setLoading(false);
        }
    };

    // Component UI rendering
    return (
        <div className="create-channel-modal-bg"> {/* Modal background wrapper */}
            <div className="create-channel-modal"> {/* Modal content container */}
                <h2 className="create-channel-title">How you'll appear</h2>

                {/* Form for channel creation */}
                <form className="create-channel-form" onSubmit={handleSubmit}>
                    
                    {/* Avatar preview section */}
                    <div className="create-channel-avatar-section">
                        {/* Show avatar image or default placeholder if not provided */}
                        <img
                            src={form.channelPic || "https://placehold.co/50.png?text=You"}
                            alt="Channel avatar"
                            className="create-channel-avatar"
                        />

                        {/* Input for channel picture URL */}
                        <input
                            type="url"
                            name="channelPic"
                            placeholder="Channel picture URL"
                            value={form.channelPic}
                            onChange={handleChange}
                            className="create-channel-input"
                            style={{ marginTop: "0.7rem" }}
                        />
                    </div>

                    {/* Fields for name, description, and banner URL */}
                    <div className="create-channel-fields">

                        {/* Channel name label and input */}
                        <label className="create-channel-label">Name</label>
                        <input
                            className="create-channel-input"
                            name="channelName"
                            type="text"
                            placeholder="Channel name"
                            value={form.channelName}
                            onChange={handleChange}
                            required
                            autoFocus
                        />

                        {/* Description label and textarea */}
                        <label className="create-channel-label">Description</label>
                        <textarea
                            className="create-channel-input"
                            name="description"
                            placeholder="Channel description"
                            value={form.description}
                            onChange={handleChange}
                            rows={2}
                        />

                        {/* Optional banner URL label and input */}
                        <label className="create-channel-label">Banner URL (optional)</label>
                        <input
                            className="create-channel-input"
                            name="channelBanner"
                            type="url"
                            placeholder="Channel banner URL"
                            value={form.channelBanner}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Action buttons for cancel and submit */}
                    <div className="create-channel-actions">

                        {/* Cancel button to go back to previous page */}
                        <button
                            type="button"
                            className="create-channel-cancel"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </button>

                        {/* Submit button to create channel, disabled if loading or no name */}
                        <button
                            type="submit"
                            className="create-channel-submit"
                            disabled={!form.channelName || loading}
                        >
                            {/* Conditional button text based on loading state */}
                            {loading ? "Creating..." : "Create channel"}
                        </button>
                    </div>

                    {/* Terms and service agreement note */}
                    <div className="create-channel-terms">
                        By clicking Create Channel you agree to{' '}
                        <a
                            href="https://www.youtube.com/t/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            YouTube's Terms of Service
                        </a>.
                    </div>
                </form>
            </div>
        </div>
    )
}

// Export the component so it can be used elsewhere
export default CreateChannel;
