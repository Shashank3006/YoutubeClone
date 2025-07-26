// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // for making HTTP requests
import Video from './Video.jsx'; // individual video card component
import '../style/homePage.css'; // styles for this component
import { useOutletContext } from 'react-router-dom'; // for accessing shared layout context
import { useAuth } from '../utils/AuthContext'; // for getting authentication info

// Functional component for displaying a list of videos
function VideoList({ sidebarOpen }) {
    // Define categories for filtering videos
    const categories = [
  "All",
  "Trending",
  "Coding",
  "Startups",
  "Artificial Intelligence",
  "Gaming",
  "Podcasts",
  "Travel",
  "Health & Fitness",
  "Food",
  "Movies & TV",
  "Music",
  "Finance",
  "Education",
  "DIY & Crafts"
];

    // Local state for video list and selected category
    const [videos, setVideos] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState("All");

    // Access the authenticated user from AuthContext
    const { user } = useAuth();
    
    

    // Access shared values from parent layout using outlet context
    const {
        searchedVal,
        setSearchedVal,
        searchActive,
        setSearchActive
    } = useOutletContext();


    
    // Fetch videos from API when the component mounts or user changes
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const { data } = await axios.get("http://localhost:5050/api/video/");
                console.log("dynamic",data)
                setVideos(data); // store videos in state
            } catch (err) {
                console.error("Failed to load videos:", err); // error handling
            }
        };

        // Only fetch videos if the user is logged in
        if (user) {
            fetchVideos();
        }
    }, []); // re-run effect when `user` changes
    

    // Handle when a category filter button is clicked
    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat); // update selected category
        setSearchedVal(); // reset search text
        setSearchActive(false); // disable search mode
    };

    // Filtered list of videos based on search or selected category
    let filteredVideos = videos;

    
        if (searchActive && searchedVal.trim()) {
            // If search is active, filter by title match
            filteredVideos = videos.filter(v =>
                v.title?.toLowerCase().includes(searchedVal.trim().toLowerCase())
            );
        } else if (selectedCategory !== "All") {
            // Else filter by selected category
            filteredVideos = videos.filter(v =>
                v.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
    

    // If search is active, always show "All" category selected visually
    const effectiveCategory = searchActive ? "All" : selectedCategory;

    return (
        <div className='home-page'>
            {/* Show category filter buttons only if user is logged in */}
            {user && (
                <div className='filter-options'>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn${effectiveCategory === cat ? ' active' : ''}`} // highlight active
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Render list of videos or a message if no videos or user is not logged in */}
            {user ? (
                <div className='videoList'>
                    {filteredVideos.length > 0 ? (
                        // Map through filtered videos and render each
                        filteredVideos.map((video) => (
                            <Video {...video} key={video._id} />
                        ))
                    ) : (
                        // No matching videos found
                        <div className="no-videos-message">
                            {user ? "No videos found" : "Please log in to view videos"}
                        </div>
                    )}
                </div>
            ) : (
                // Prompt user to log in
                <div className="login-prompt">
                    <h3>Please log in to view videos</h3>
                    {/* Optional: add a <Link> to login page here */}
                </div>
            )}
        </div>
    );
}

// Export component for use in other files
export default VideoList;
