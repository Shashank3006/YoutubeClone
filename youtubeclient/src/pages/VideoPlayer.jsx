// Importing React and required hooks
import React, { useState, useEffect } from 'react'

// Import routing hooks to get URL parameters and link to other pages
import { Link, useParams } from 'react-router-dom'

// Importing static recommended video data from local asset file
import { STATIC_RECOMMENDED } from '../assets/RecommendedVideos.jsx'; 

// Importing authentication context to get the current logged-in user
import { useAuth } from '../utils/AuthContext.jsx'; 

// Importing a utility function from date-fns to format time into "time ago"
import { formatDistanceToNow } from 'date-fns';

// Importing CSS styles for the VideoPlayer component
import '../style/videoPlayer.css'

// Importing axios for making HTTP requests
import axios from 'axios';

// Importing required icons from the react-icons library
import { AiOutlineLike, AiFillLike, AiOutlineDislike, AiFillDislike } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdShare } from "react-icons/io";
import { MdDownload } from "react-icons/md";

// VideoPlayer component: Responsible for rendering a video watch page
function VideoPlayer() {

    // Extracting the videoId from the route parameters (e.g. /video/:videoId)
    const { videoId } = useParams();

    // Getting the current logged-in user from the auth context
    const { user } = useAuth();

    // Local state to hold the video data fetched from the backend
    const [video, setVideo] = useState(null);

    // Loading indicator while the video data is being fetched
    const [loading, setLoading] = useState(true);

    // To store any error message encountered during data fetch
    const [error, setError] = useState(null);

    // State to manage if the current user liked the video
    const [liked, setLiked] = useState(false);

    // State to manage if the current user disliked the video
    const [disliked, setDisliked] = useState(false);

    // Number of likes on the video
    const [likeCount, setLikeCount] = useState(0);

    // Number of dislikes on the video
    const [dislikeCount, setDislikeCount] = useState(0);

    // Toggle for expanding/collapsing the video description
    const [descExpanded, setDescExpanded] = useState(false);

    // Text input value for the new comment being written
    const [comment, setComment] = useState("");

    // List of all comments for the video
    const [comments, setComments] = useState([]);

    // Track which comment menu is currently open (for editing/deleting)
    const [menuOpen, setMenuOpen] = useState(null);

    // Stores the ID of the comment currently being edited
    const [editId, setEditId] = useState(null);

    // Stores the text of the comment currently being edited
    const [editText, setEditText] = useState("");


    /// Fetch video and comments whenever videoId or user changes
useEffect(() => {
    
    // Set loading to true before fetching data
    setLoading(true);

    // Reset error state
    setError(null);

    // Use Promise.all to run both API requests in parallel
    Promise.all([
        // Fetch video details from backend using videoId
        axios.get(`http://localhost:5050/api/video/${videoId}`),

        // Fetch comments for the video
        axios.get(`http://localhost:5050/api/comment/${videoId}`)
    ])
        .then(([videoRes, commentRes]) => {
            // If both API calls succeed, destructure the responses

            // Set the video data in state
            setVideo(videoRes.data);

            // Set like and dislike counts from fetched video data (use 0 as fallback)
            setLikeCount(videoRes.data.likes || 0);
            setDislikeCount(videoRes.data.dislikes || 0);

            // Sort comments by timestamp/createdAt in descending order (latest comment first)
            const sortedComments = (commentRes.data || []).slice().sort((a, b) => {
                const aTime = new Date(a.timestamp || a.createdAt).getTime();
                const bTime = new Date(b.timestamp || b.createdAt).getTime();
                return bTime - aTime; // Newer comment comes first
            });

            // Format and map comment data into local structure
            setComments(
                sortedComments.map(c => ({
                    _id: c._id, // comment ID
                    username: c.user?.username || "Unknown", // fallback username
                    avatar: c.user?.avatar || "https://placehold.co/40x40.png?text=?", // fallback avatar
                    text: c.text, // comment text
                    timestamp: c.timestamp || c.createdAt, // comment date
                    userId: c.user?._id // user ID of the commenter
                }))
            );

            // If user is logged in, check if user has liked/disliked this video
            if (user) {
                setLiked(videoRes.data.likedBy?.includes(user._id));
                setDisliked(videoRes.data.dislikedBy?.includes(user._id));
            } else {
                // Reset like/dislike if no user is logged in
                setLiked(false);
                setDisliked(false);
            }
        })
        .catch(err => {
            // Catch and handle errors from either API call
            setError("Failed to load video.");
        })
        .finally(() => setLoading(false)); // Mark loading as done regardless of success or error

// Dependencies: re-run when either videoId or user changes
}, [videoId, user]);

    // Like/dislike logic (persist to backend)
    const handleLike = async () => {
        if (!user) return;
        try {
            if (liked) {
                const res = await axios.patch(
                    `http://localhost:5050/api/video/${videoId}/unlike`, // API calling to unlike a video
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } } // send JWT token in header
                );
                setLiked(false);
                setLikeCount(res.data.likes);
                setDislikeCount(res.data.dislikes);
            } else {
                const res = await axios.patch(
                    `http://localhost:5050/api/video/${videoId}/like`, // API calling for liking video
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } } // JWT in header
                );
                setLiked(true);
                setDisliked(false);
                setLikeCount(res.data.likes);
                setDislikeCount(res.data.dislikes);
            }
        } catch (err) {
            alert("Failed to update like"); // alert if anything goes wrong
        }
    };

    const handleDislike = async () => {
        if (!user) return;
        try {
            if (disliked) {
                const res = await axios.patch(
                    `http://localhost:5050/api/video/${videoId}/undislike`, // API calling to unDislike
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setDisliked(false);
                setLikeCount(res.data.likes);
                setDislikeCount(res.data.dislikes);
            } else {
                const res = await axios.patch(
                    `http://localhost:5050/api/video/${videoId}/dislike`, // API calling to dilike
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setDisliked(true);
                setLiked(false);
                setLikeCount(res.data.likes);
                setDislikeCount(res.data.dislikes);
            }
        } catch (err) {
            alert("Failed to update dislike"); // alert if anything goes wrong
        }
    };

    // Add comment logic (POST to backend, then fetch comments)
    const handleComment = async () => {
        if (!user || !comment.trim()) return;
        try {
            await axios.post(
                "http://localhost:5050/api/comment", // Api for posting new comment
                { text: comment, videoId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Fetch updated comments from backend
            const res = await axios.get(`http://localhost:5050/api/comment/${videoId}`); // API for fetching all comments on a video
            
            // Sort comments by timestamp/createdAt descending (latest first)
            const sortedComments = (res.data || []).slice().sort((a, b) => {
                const aTime = new Date(a.timestamp || a.createdAt).getTime();
                const bTime = new Date(b.timestamp || b.createdAt).getTime();
                return bTime - aTime;
            });
            // set newly fetched comments in state
            setComments(
                sortedComments.map(c => ({
                    _id: c._id,
                    username: c.user?.username || "Unknown",
                    avatar: c.user?.avatar || "https://placehold.co/40x40.png?text=?",
                    text: c.text,
                    timestamp: c.timestamp || c.createdAt,
                    userId: c.user?._id
                }))
            );
            setComment("");
        } catch (err) {
            alert("Failed to add comment"); // alert if commenting failed
        }
    };

    // Delete comment logic (DELETE to backend, then fetch comments)
    const handleDelete = async (id) => {
        if (!user) return; // if user is not logged in return
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(
                `http://localhost:5050/api/comment/${id}`, // API calling for deleting a comment
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Always fetch updated comments from backend after delete
            const res = await axios.get(`http://localhost:5050/api/comment/${videoId}`);
            // Sort comments by timestamp/createdAt descending (latest first)
            const sortedComments = (res.data || []).slice().sort((a, b) => {
                const aTime = new Date(a.timestamp || a.createdAt).getTime();
                const bTime = new Date(b.timestamp || b.createdAt).getTime();
                return bTime - aTime;
            });
            setComments(
                sortedComments.map(c => ({
                    _id: c._id,
                    username: c.user?.username || "Unknown",
                    avatar: c.user?.avatar || "https://placehold.co/40x40.png?text=?",
                    text: c.text,
                    timestamp: c.timestamp || c.createdAt,
                    userId: c.user?._id
                }))
            );
            setMenuOpen(null);
        } catch (err) {
            alert("Failed to delete comment");
        }
    };

    // Edit comment logic (PATCH to backend, then fetch comments)
    const handleEdit = (comment) => {
        setEditId(comment._id);
        setEditText(comment.text);
        setMenuOpen(null);
    };

    const handleEditSave = async (id) => {
        if (!user || !editText.trim()) return;
        try {
            await axios.patch(
                `http://localhost:5050/api/comment/${id}`, // API calling for updating/editing a comment
                { text: editText },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            // Fetch updated comments from backend
            const res = await axios.get(`http://localhost:5050/api/comment/${videoId}`);
            // Sort comments by timestamp/createdAt descending (latest first)
            const sortedComments = (res.data || []).slice().sort((a, b) => {
                const aTime = new Date(a.timestamp || a.createdAt).getTime();
                const bTime = new Date(b.timestamp || b.createdAt).getTime();
                return bTime - aTime;
            });
            setComments(
                sortedComments.map(c => ({
                    _id: c._id,
                    username: c.user?.username || "Unknown",
                    avatar: c.user?.avatar || "https://placehold.co/40x40.png?text=?",
                    text: c.text,
                    timestamp: c.timestamp || c.createdAt,
                    userId: c.user?._id
                }))
            );
            setEditId(null);
            setEditText("");
        } catch (err) {
            alert("Failed to edit comment");
        }
    };

    const handleEditCancel = () => {
        setEditId(null);
        setEditText("");
    };

    // Description expand and collapse logic
    const descLimit = 180;
    const showMore = video && video.description && video.description.length > descLimit;
    const descToShow = video && video.description
        ? (descExpanded ? video.description : video.description.slice(0, descLimit))
        : "";

    if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
    if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
    if (!video) return null;

    // return JSX
    return (
        <div className="video-player-page light">
            <div className="video-player-main">
                <div className="video-player-container">
                    <video
                        className="video-player"
                        src={video.videoLink}
                        poster={video.thumbnail}
                        controls
                    />
                </div>
                <div className="video-player-title">{video.title}</div>
                <div className="video-player-row">
                    <div className="video-player-channel-row">

                        {/* channel pic and name inside Link to the channel */}
                        <Link to={`/channels/${video?.channel?._id}`}>
                            <img src={video.channel?.channelPic} alt={video.channel?.channelName} className="video-player-channel-pic" />
                        </Link>
                        <Link to={`/channels/${video?.channel?._id}`}>
                            <div className="video-player-channel-info">
                                <div className="video-player-channel-name">{video.channel?.channelName}</div>
                                <div className="video-player-subscribers">{video.channel?.subscribers?.toLocaleString() || 0} subscribers</div>
                            </div>
                        </Link>
                        <button className="video-player-subscribe-btn">Subscribe</button>
                    </div>
                    {

                        // only show like/dislike buttons to 'Logged-In Users'
                        user && (
                            <div className="video-player-actions">
                        <button
                            className={`video-player-action-btn${liked ? ' active' : ''}`}
                            onClick={handleLike}
                            disabled={!user}
                            title={!user ? "Login to like" : ""}
                        >
                            {liked ? <AiFillLike /> : <AiOutlineLike />}
                            <span>{likeCount}</span>
                        </button>
                        <button
                            className={`video-player-action-btn${disliked ? ' active' : ''}`}
                            onClick={handleDislike}
                            disabled={!user}
                            title={!user ? "Login to dislike" : ""}
                        >
                            {disliked ? <AiFillDislike /> : <AiOutlineDislike />}
                            <span>{dislikeCount}</span>
                        </button>
                        <button className="video-player-action-btn static-btn">
                            <IoMdShare />
                            <span>Share</span>
                        </button>
                        <button className="video-player-action-btn static-btn">
                            <MdDownload />
                            <span>Download</span>
                        </button>
                        <button className="video-player-action-btn static-button">
                            <BsThreeDotsVertical />
                        </button>
                    </div>
                        )
                    }
                </div>
                <div className="video-player-description">
                    <div className="video-player-desc-meta">
                        <span className="video-player-desc-views">{(video.views || 0).toLocaleString()} views</span>
                        <span className="video-player-desc-dot">•</span>
                        <span className="video-player-desc-date">{video.uploadDate ? new Date(video.uploadDate).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric"}): ""}</span>
                    </div>
                    <div className="video-player-desc-text">

                        {/* description with collapse and expand functionality */}
                        {descToShow}
                        {showMore && !descExpanded && (
                            <span className="desc-more" onClick={() => setDescExpanded(true)}>...more</span>
                        )}
                        {showMore && descExpanded && (
                            <span className="desc-less" onClick={() => setDescExpanded(false)}> Show less</span>
                        )}
                    </div>
                </div>

                {/* comment section -------------------------------- */}
                <div className="video-player-comments">
                    <div className="video-player-comments-title">
                        {comments.length} Comments
                    </div>
                    <div className="video-player-add-comment">
                        <img
                            src={user?.avatar || "https://placehold.co/40.png?text=?"}
                            alt={user?.username || "User"}
                            className="video-player-comment-avatar"
                        />
                        <input
                            className="video-player-comment-input"
                            placeholder={user ? "Add a comment..." : "Login to comment"}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleComment(); }}
                            disabled={!user}
                        />
                        <button
                            className="video-player-comment-btn"
                            onClick={handleComment}
                            disabled={!user || !comment.trim()}
                        >
                            Comment
                        </button>
                    </div>
                    <div className="video-player-comments-list">
                        {comments.map(comment => (
                            <div className="video-player-comment" key={comment._id}>
                                <img src={comment.avatar} alt={comment.username} className="video-player-comment-avatar" />
                                <div className="video-player-comment-body">
                                    <div className="video-player-comment-header">
                                        <span className="video-player-comment-username">{comment.username}</span>
                                        <span className="video-player-comment-time">
                                            {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : ""}
                                        </span>
                                        {user && comment.userId === user._id && (
                                            <span
                                                className="comment-meatball"
                                                tabIndex={0}
                                                onClick={() =>
                                                    setMenuOpen(menuOpen === comment._id ? null : comment._id)
                                                }
                                            >
                                                <BsThreeDotsVertical />
                                                {menuOpen === comment._id && (
                                                    <div className="comment-menu-dropdown">
                                                        <button
                                                            className="comment-menu-item"
                                                            onClick={() => handleEdit(comment)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="comment-menu-item delete"
                                                            onClick={() => handleDelete(comment._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="video-player-comment-text">
                                        {editId === comment._id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    className="video-player-comment-input"
                                                    value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    style={{ flex: 1, minWidth: 0 }}
                                                />
                                                <button
                                                    className="video-player-comment-btn"
                                                    style={{ padding: "0.3rem 1rem", fontSize: "0.95rem" }}
                                                    onClick={() => handleEditSave(comment._id)}
                                                    disabled={!editText.trim()}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="video-player-comment-btn"
                                                    style={{ padding: "0.3rem 1rem", fontSize: "0.95rem", background: "#eee", color: "#222" }}
                                                    onClick={handleEditCancel}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            comment.text
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* recommended video section. video list fetched from assets/recommendedvideos.js */}
            <div className="video-player-sidebar">
                <div className="video-player-recommend-title">Up next</div>
                <div className="video-player-recommend-list">
                    {STATIC_RECOMMENDED.map(v => (

                        // link to the video based on :id parameter
                        <Link
                            to={`/video/${v._id}`}
                            className="video-player-recommend-item"
                            key={v._id}
                            style={{ display: "flex", alignItems: "center", gap: "0.8rem", textDecoration: "none" }}
                        >
                            <img
                                src={v.thumbnail}
                                alt={v.title}
                                style={{
                                    width: 80,
                                    height: 48,
                                    objectFit: "cover",
                                    borderRadius: 6,
                                    background: "#eee",
                                    flexShrink: 0
                                }}
                            />
                            <span style={{ color: "#222", fontWeight: 500, fontSize: "1rem", lineHeight: "1.2" }}>
                                {v.title}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer; // export videoPlayer app