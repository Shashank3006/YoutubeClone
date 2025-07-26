import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'; // import axios for calling APIs
import '../style/channel.css' // import css for styling
import { useAuth } from '../utils/AuthContext.jsx'; // to import logged in user
import { BsThreeDotsVertical } from "react-icons/bs"; // icons from react-icons library

// Page for viewing another user's channel (not your own)
function Channels() {
    const { id } = useParams(); // id of channel from URL parameter
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [descExpanded, setDescExpanded] = useState(false);
    const { user, setUser } = useAuth(); // get logged in user
    const navigate = useNavigate(); // get navigate from hook

    // If user visits their own channel, redirect to /channel
    if(user?.channelId == id) navigate("/channel");

    // Fetch channel data by id
    useEffect(() => {
        setLoading(true);
        setError(null);

        // get channel from API calling with axios
        axios.get(`http://localhost:5050/api/channel/${id.replace(':', '')}`)
            .then(res => {
                setChannel(res.data); // set fetched data in channel state
            })
            .catch(() => setError("Failed to load channel")) // set error, if caught any
            .finally(() => setLoading(false)); // finally stop loading
    }, [id]); // dependancy array has id (if id changes, channel will be fetched again)

    // logic for loading, handling error and channel being empty
    if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
    if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
    if (!channel) return null;

    // logic for expanding and collapsing description
    const descLimit = 180;
    const showMore = channel.description && channel.description.length > descLimit;
    const descToShow = descExpanded || !showMore
        ? channel.description
        : channel.description.slice(0, descLimit);

    // return JSX
    return (
        <div className="channel-page" style={{ flex: 1 }}>
            <div className="channel-banner-container">
                <img
                    className="channel-banner"
                    // if channel banner does't exist show placeholder banner
                    src={channel.channelBanner || "https://placehold.co/600x150.png?text=Banner"}
                    alt="Channel banner"
                />
            </div>
            <div className="channel-header">
                <img className="channel-avatar" src={channel.channelPic || "https://placehold.co/100x100.png?text=?"} alt={channel.channelName} />
                <div className="channel-info">
                    <div className="channel-title">{channel.channelName}</div>
                    <div className="channel-meta">

                        {/* add channel handle logic */}
                        <span className="channel-handle">@{channel.channelName?.toLowerCase().replace(/\s/g, '')}-ic4ou</span>
                        <span className="channel-dot">·</span>
                        <span className="channel-subs">{channel.subscribers} subscribers</span>
                        <span className="channel-dot">·</span>
                        <span className="channel-videos">{channel.videos?.length || 0} videos</span>
                    </div>

                    {/* logic for expanding and collapsing description */}
                    <div className="channel-desc">
                        {descToShow}
                        {showMore && !descExpanded && (
                            <span className="desc-more" onClick={() => setDescExpanded(true)}>...more</span>
                        )}
                        {showMore && descExpanded && (
                            <span className="desc-less" onClick={() => setDescExpanded(false)}> Show less</span>
                        )}
                    </div>
                    <div className="channel-actions">
                        <button className="channel-btn subscribe">Subscribe</button>
                    </div>
                </div>
            </div>

            {/* static channel tabs */}
            <div className="channel-tabs">
                <div className="channel-tab">Home</div>
                <div className="channel-tab active">Videos</div> {/* videos is the active tab (always) */}
                <div className="channel-tab">Shorts</div>
                <div className="channel-tab">Playlists</div>
                <div className="channel-tab">Posts</div>
            </div>

            {/* map on channel's videos to render video cards */}
            <div className="channel-videos-list">
                {(channel.videos || []).map(video => (
                    <div className="channel-video-card" key={video._id}>
                        <Link to={`/video/${video._id}`}>
                            <img className="channel-video-thumb" src={video.thumbnail} alt={video.title} />
                        </Link>
                        <div className="channel-video-info">
                            <div className="channel-video-title">{video.title}</div>
                            <div className="channel-video-meta">
                                <span>{video.views} views</span>
                                <span className="channel-dot">·</span>

                                {/* formatting upload date for better 'User Experience' */}
                                <span>{video.uploadDate? new Date(video.uploadDate).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric"}): ""}</span>
                            </div>
                        </div>
                        <div className="channel-video-actions">
                            <span className="channel-video-meatball" tabIndex={0}>
                                <BsThreeDotsVertical /> {/* static meatball icons on video cards */}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Channels; // export Channels component page