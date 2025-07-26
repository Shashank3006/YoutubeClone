// Import React library for building the component
import React from 'react'

// Import Link for navigation between routes
import { Link } from 'react-router-dom'

// Import utility from date-fns to format date as "x time ago"
import { formatDistanceToNow } from 'date-fns'

// Import CSS for styling this component
import '../style/homePage.css'

// Functional component to render a video card
function Video({ _id, title, channel, views, thumbnail, uploadDate }) {
    return (
        <div className='video'> 
            {/* Thumbnail image - wrapped with a link to the video player route */}
            <Link className='video-pic' to={`/Video/${_id}`}>
                <img src={thumbnail} alt={title} className='thumbnail' />
            </Link>

            <div>
                <figure className='channel'>
                    {/* Channel picture - links to the channel's page */}
                    <Link to={`/channels/${channel._id}`}>
                        <img
                            src={channel.channelPic}
                            alt={channel.channelName}
                            className='channel-icon'
                        />
                    </Link>
                </figure>

                <div>
                    {/* Video title - links to the video player */}
                    <Link to={`/Video/${_id}`}>
                        <div className='video-title'>{title}</div>
                    </Link>

                    {/* Channel name - links to the channel page */}
                    <Link to={`/channels/${channel._id}`}>
                        <div className='channel-name'>{channel.channelName}</div>
                    </Link>

                    {/* Views count and upload date (formatted as relative time) */}
                    <div className='views'>
                        {views} views

                        {/* Only show upload date if available */}
                        <span className="video-card-date">
                            {uploadDate
                                ? " • " + formatDistanceToNow(new Date(uploadDate), {
                                      addSuffix: true, // adds 'ago' to the end
                                  }).replace('about ', '') // optional cleanup of "about"
                                : ""}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export the Video component so it can be used in other parts of the app
export default Video
