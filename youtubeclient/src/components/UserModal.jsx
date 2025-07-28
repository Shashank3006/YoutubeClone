import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext.jsx' // Import custom AuthContext to access user state
import '../style/userModal.css' // Import CSS for modal styling

// Import various icons used in modal options
import {
  MdOutlineAccountCircle, MdOutlineSwitchAccount, MdLogout,
  MdOutlineSettings, MdOutlineLanguage, MdOutlineLocationOn
} from "react-icons/md";
import { FiChevronRight } from "react-icons/fi";
import { BsMoon, BsSun } from "react-icons/bs";
import { FaRegKeyboard } from "react-icons/fa";

// UserModal component for managing user-related actions and settings
function UserModal({ onClose, setShowModal }) {
  const { user, setUser } = useAuth();      // Access current user and setter from AuthContext
  const navigate = useNavigate();           // React Router's navigate function

  // Navigate to the user's channel
  const handleViewChannel = () => {
    navigate("/channel");                   // Redirect to /channel
    setShowModal(false);                    // Close modal
  };

  // Navigate to channel creation page
  const handleCreateChannel = () => {
    navigate("/createChannel");             // Redirect to /createChannel
    setShowModal(false);                    // Close modal
  };

  // Handle user sign-out
  const handleSignOut = () => {
    localStorage.removeItem('user');        // Clear user from localStorage
    setUser(null);                          // Update auth context to reflect logout
    setShowModal(false);     
    navigate("/login");                // Close modal
  };

  return (
    // Modal overlay, closes when clicking outside the modal box
    <div className="user-modal-overlay" onClick={onClose}>
      {/* Modal box (prevent closing when clicking inside modal) */}
      <div className="user-modal" onClick={e => e.stopPropagation()}>

        {/* Modal Header: shows user profile info */}
        <div className="user-modal-header">
          <img
            src={user.avatar}                         // User's avatar
            alt={user.username}                       // Alt for accessibility
            className="user-modal-avatar"             // Avatar styling
          />
          <div className="user-modal-info">
            <div className="user-modal-username">{user.username}</div>  {/* Username */}
            <div className="user-modal-userid">
              @{user._id?.toLowerCase().replace(/\s/g, '') || 'user'}   {/* Cleaned UID */}
            </div>

            {/* Conditionally show "View your channel" or "Create your channel" */}
            {user.channelId ? (
              <span className="user-modal-link" onClick={handleViewChannel}>
                View your channel
              </span>
            ) : (
              <span className="user-modal-link" onClick={handleCreateChannel}>
                Create your channel
              </span>
            )}
          </div>
        </div>

        {/* Divider line between sections */}
        <div className="user-modal-divider"></div>

        {/* Section: Account options */}
        <div className="user-modal-list">
          <div className="user-modal-listitem">
            <MdOutlineAccountCircle className="user-modal-icon" />
            Google Account
          </div>
          <div className="user-modal-listitem user-modal-listitem-arrow">
            <MdOutlineSwitchAccount className="user-modal-icon" />
            Switch account
            <FiChevronRight className="user-modal-arrow" />
          </div>

          {/* Logout option */}
          <div className="user-modal-listitem" onClick={handleSignOut}>
            <MdLogout className="user-modal-icon" />
            Sign out
          </div>
        </div>

        {/* Divider line */}
        <div className="user-modal-divider"></div>

        {/* Section: YouTube-related links */}
        <div className="user-modal-list">
          <div className="user-modal-listitem">
            <MdOutlineSettings className="user-modal-icon" />
            YouTube Studio
          </div>
          <div className="user-modal-listitem">
            <MdOutlineSettings className="user-modal-icon" />
            Purchases and memberships
          </div>
        </div>

        {/* Divider line */}
        <div className="user-modal-divider"></div>

        {/* Section: Appearance, Language, and other static settings */}
        <div className="user-modal-list">
          <div className="user-modal-listitem">
            <MdOutlineSettings className="user-modal-icon" />
            Your data in YouTube
          </div>
          <div className="user-modal-listitem user-modal-listitem-arrow">
            <BsSun className="user-modal-icon" />
            Appearance: Light
            <FiChevronRight className="user-modal-arrow" />
          </div>
          <div className="user-modal-listitem user-modal-listitem-arrow">
            <MdOutlineLanguage className="user-modal-icon" />
            Language: English
            <FiChevronRight className="user-modal-arrow" />
          </div>
          <div className="user-modal-listitem">
            <MdOutlineSettings className="user-modal-icon" />
            Restricted Mode: Off
          </div>
          <div className="user-modal-listitem">
            <MdOutlineLocationOn className="user-modal-icon" />
            Location: India
          </div>
          <div className="user-modal-listitem">
            <FaRegKeyboard className="user-modal-icon" />
            Keyboard shortcuts
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserModal; // Export the component for use elsewhere
