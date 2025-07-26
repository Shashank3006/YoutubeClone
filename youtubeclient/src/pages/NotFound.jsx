import React from 'react' 
// Import the React library to use JSX and create components

import { Link } from 'react-router-dom' 
// Import 'Link' from react-router-dom for navigation between routes without page reload

import { BsYoutube } from 'react-icons/bs' 
// Import the YouTube icon component from 'react-icons' (Bootstrap icons set)

import '../style/notFound.css' 
// Import the custom CSS file for styling the NotFound component

// Not Found errorElement page component for 'User Experience' (Link back to Home)
function NotFound() {
  return (
    // Main container with accessibility roles for screen readers
    <div className="notfound-container" role="alert" aria-label="Page not found">

      {/* Row for YouTube logo and text */}
      <div className="notfound-logo-row">
        <BsYoutube className="notfound-icon" /> {/* YouTube icon */}
        <span className="notfound-youtube">YouTube</span> {/* Text label next to icon */}
      </div>

      {/* Big "404" Error code */}
      <div className="notfound-404">404</div>

      {/* Message to inform the user the page isn't available */}
      <div className="notfound-message">This page isn't available. Sorry about that.</div>

      {/* Link to redirect the user back to the homepage */}
      <Link to="/" className="notfound-home-link">
        Go to YouTube Home
      </Link>
    </div>
  );
}

// Export the NotFound component so it can be used in other parts of the app
export default NotFound;
