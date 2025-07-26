// Import core React functionality
import React from 'react'

// Import Link component from react-router-dom for client-side navigation
import { Link } from 'react-router-dom';

// Import sidebar icons from react-icons
import { SiYoutubeshorts } from "react-icons/si"; // YouTube Shorts icon
import { MdSubscriptions } from "react-icons/md"; // Subscriptions icon
import { IoMdHome } from "react-icons/io"; // Home icon

// Functional component to render the Sidebar navigation
function SideNavBar({ sidebarOpen }) {
    return (
        // Apply className based on sidebarOpen state: expands if true, collapses if false
        <nav className={`sideBar${sidebarOpen ? '' : ' collapsed'}`}>
            
            {/* Link to home page with Home icon and label */}
            <Link to="/" className="sideBar-item">
                <IoMdHome /> {/* Home icon */}
                <span className="sideBar-label">Home</span> {/* Label text */}
            </Link>

            {/* Static sidebar item for Shorts (not a Link for now) */}
            <div className="sideBar-item">
                <SiYoutubeshorts /> {/* Shorts icon */}
                <span className="sideBar-label">Shorts</span> {/* Label text */}
            </div>

            {/* Static sidebar item for Subscriptions */}
            <div className="sideBar-item">
                <MdSubscriptions /> {/* Subscriptions icon */}
                <span className="sideBar-label">Subscriptions</span> {/* Label text */}
            </div>
        </nav>
    )
}

// Export the Sidebar component so it can be used in other files
export default SideNavBar
