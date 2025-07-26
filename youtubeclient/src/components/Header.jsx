// Import React and useState hook
import React, { useState } from 'react';

// Import navigation-related functions from react-router-dom
import { Link, useNavigate } from 'react-router-dom';

// Import custom authentication context to access logged-in user
import { useAuth } from '../utils/AuthContext.jsx';

// Import modal component for user profile/logout options
import UserModal from './UserModal.jsx';

// Import axios for API requests
import axios from 'axios';

// Import styles
import '../style/homePage.css';
import '../style/registerLogin.css';
import '../style/createChannel.css';

// Import icons from react-icons
import { RxHamburgerMenu } from "react-icons/rx";      // Hamburger menu icon
import { FaYoutube } from "react-icons/fa";             // YouTube logo icon
import { CiSearch } from "react-icons/ci";              // Search icon
import { FaBell, FaUser } from "react-icons/fa";        // Bell and User icons
import { RiVideoUploadLine } from "react-icons/ri";     // Video upload icon

// Header component definition
function Header({ sidebarOpen, setSidebarOpen, searchedVal, setSearchedVal, onSearch }) {
    const { user, setUser } = useAuth();           // Access user and update function from context
    const navigate = useNavigate();                // useNavigate hook for navigation
    const [showModal, setShowModal] = useState(false);       // State to control user modal visibility
    const [showUpload, setShowUpload] = useState(false);     // State to control video upload modal visibility

    // Local state to store video upload form data
    const [form, setForm] = useState({
        title: '',
        videoLink: '',
        thumbnail: '',
        description: '',
        category: ''
    });

    const [formLoading, setFormLoading] = useState(false);   // Track if upload is in progress

    // Handler for typing in search input
    function handleSearchInput(e) {
        setSearchedVal(e.target.value);     // Update search state passed from parent
    }

    // Handler when search button is clicked
    function handleSearchBtn(e) {
        e.preventDefault();                 // Prevent default form behavior
        if (onSearch) onSearch();           // Safely call search function if defined
    }

    // Handler to show upload modal and reset form
    const handleUpload = () => {
        setForm({                           // Reset form fields
            title: '',
            videoLink: '',
            thumbnail: '',
            description: '',
            category: ''
        });
        setShowUpload(true);               // Show upload form
    };

    // Handler to submit the upload form
    const handleUploadSubmit = async (e) => {
        e.preventDefault();                 // Prevent page reload
        setFormLoading(true);              // Set form loading to true

        // Trim form fields to clean extra whitespace
        const trimmed = {
            title: form.title.trim(),
            videoLink: form.videoLink.trim(),
            thumbnail: form.thumbnail.trim(),
            description: form.description.trim(),
            category: form.category.trim()
        };

        // Validate required fields
        if (!trimmed.title || !trimmed.videoLink || !trimmed.thumbnail) {
            alert("Please fill in all required fields.");
            setFormLoading(false);
            return;
        }

        try {
            // Send POST request to upload video
            await axios.post(
                "http://localhost:5100/api/video",
                trimmed,
                { headers: { Authorization: `Bearer ${user.token}` } } // JWT token header
            );

            alert("Video uploaded!");         // Notify success
            setShowUpload(false);             // Hide upload modal

            // Reset form fields after upload
            setForm({
                title: '',
                videoLink: '',
                thumbnail: '',
                description: '',
                category: ''
            });

        } catch (err) {
            // Catch and show any error
            alert("Failed to upload video: " + (err.response?.data?.message || err.message));
        } finally {
            setFormLoading(false);           // Reset loading state
        }
    };

    return (
        <>
            {/* Upload video modal */}
            {showUpload && (
                <div className="create-channel-modal-bg" style={{ zIndex: 3000 }}>
                    <div className="create-channel-modal" style={{ maxWidth: 500 }}>
                        <h2 className="create-channel-title">Upload Video</h2>

                        {/* Upload form */}
                        <form className="create-channel-form" onSubmit={handleUploadSubmit}>
                            <div className="create-channel-fields">
                                <label className="create-channel-label">Title</label>
                                <input
                                    className="create-channel-input"
                                    name="title"
                                    type="text"
                                    placeholder="Video title"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    required
                                    autoFocus
                                />
                                <label className="create-channel-label">Video Link (URL)</label>
                                <input
                                    className="create-channel-input"
                                    name="videoLink"
                                    type="url"
                                    placeholder="Video file URL"
                                    value={form.videoLink}
                                    onChange={e => setForm({ ...form, videoLink: e.target.value })}
                                    required
                                />
                                <label className="create-channel-label">Thumbnail URL</label>
                                <input
                                    className="create-channel-input"
                                    name="thumbnail"
                                    type="url"
                                    placeholder="Thumbnail image URL"
                                    value={form.thumbnail}
                                    onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                                    required
                                />
                                <label className="create-channel-label">Description</label>
                                <textarea
                                    className="create-channel-input"
                                    name="description"
                                    placeholder="Video description"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                />
                                <label className="create-channel-label">Category</label>
                                <input
                                    className="create-channel-input"
                                    name="category"
                                    type="text"
                                    placeholder="Category"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                />
                            </div>

                            {/* Upload and Cancel buttons */}
                            <div className="create-channel-actions">
                                <button
                                    type="button"
                                    className="create-channel-cancel"
                                    onClick={() => setShowUpload(false)}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="create-channel-submit"
                                    disabled={!form.title || !form.videoLink || !form.thumbnail || formLoading}
                                >
                                    {formLoading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main header content */}
            <header className='header'>
                <div className='left'>
                    {/* Sidebar toggle button */}
                    <span onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }}>
                        <RxHamburgerMenu />
                    </span>

                    {/* Logo linking to homepage */}
                    <Link to="/" className='youtube'>
                        <FaYoutube className="fa-youtube" />
                        <h2>YouTube</h2>
                    </Link>
                </div>

                {/* Search bar section */}
                <div className='mid'>
                    <input
                        placeholder="Search"
                        onChange={handleSearchInput}
                        value={searchedVal}
                    />
                    <button onClick={handleSearchBtn}>
                        <CiSearch />
                    </button>
                </div>

                {/* Right-side user and upload icons */}
                <div className='right'>
                    {/* Show upload icon only if user has a channel */}
                    {user?.channelId && (
                        <RiVideoUploadLine onClick={() => setShowUpload(true)} />
                    )}
                    {/* Bell icon for logged-in users */}
                    {user && <FaBell />}

                    {/* Conditional rendering based on user login status */}
                    {user ? (
                        <>
                            {/* User avatar, toggles modal on click */}
                            <img
                                src={user.avatar}
                                alt="User"
                                className="header-avatar"
                                onClick={() => setShowModal(v => !v)}
                                style={{ cursor: 'pointer', borderRadius: '50%' }}
                            />
                            {/* Conditionally show user modal */}
                            {showModal && (
                                <UserModal setShowModal={setShowModal} onClose={() => setShowModal(false)} />
                            )}
                        </>
                    ) : (
                        <>
                            {/* Auth links if user is not logged in */}
                            <Link to="/login" className="header-auth-link">Log-in</Link>
                            <Link to="/register" className="header-auth-link signup">Register</Link>
                        </>
                    )}
                </div>
            </header>
        </>
    );
}

// Export the Header component
export default Header;
