import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom'; // Used to access layout context (like sidebar visibility)
import axios from 'axios'; // Axios for making HTTP requests
import '../style/channel.css'; // External CSS for styling this component
import { useAuth } from '../utils/AuthContext.jsx'; // Context to access currently logged-in user info

// Icons from react-icons for UI buttons like edit, delete, upload
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdEdit, MdDelete, MdUpload, MdSave, MdClose } from "react-icons/md";

// Main functional component for user's own channel dashboard
function YourChannel() {
  // Layout context to determine if sidebar is open
  const { sidebarOpen } = useOutletContext();

  // Get current logged-in user from custom AuthContext
  const { user } = useAuth();

  // State variables
  const [channel, setChannel] = useState(null); // Holds the current user's channel info
  const [videos, setVideos] = useState([]); // Array of videos uploaded on the channel
  const [menuOpen, setMenuOpen] = useState(null); // Which video has its "three dots" menu open
  const [descExpanded, setDescExpanded] = useState(false); // For toggling expanded/collapsed description
  const [loading, setLoading] = useState(true); // Page loading state
  const [error, setError] = useState(null); // For capturing API errors

  // State for video upload/edit modals
  const [showUpload, setShowUpload] = useState(false); // Show/hide upload modal
  const [showEdit, setShowEdit] = useState(false); // Show/hide edit modal
  const [editVideo, setEditVideo] = useState(null); // Video being edited

  // Initial form values for video upload/edit
  const initialForm = {
    title: '',
    videoLink: '',
    thumbnail: '',
    description: '',
    category: ''
  };
  const [form, setForm] = useState(initialForm); // Form state for video input
  const [formLoading, setFormLoading] = useState(false); // Form submission loading

  // State for channel edit modal and form
  const [showEditChannel, setShowEditChannel] = useState(false); // Channel edit modal visibility
  const [channelEditForm, setChannelEditForm] = useState({
    channelName: "",
    channelBanner: "",
    channelPic: "",
    description: ""
  });
  const [channelEditLoading, setChannelEditLoading] = useState(false); // Channel edit submit loading

  // Fetch user's channel and associated videos once on mount
  useEffect(() => {
    if (!user?.channelId) return; // If no channel ID, skip API call

    setLoading(true);  // Start loading animation
    setError(null);    // Reset error

    // API call to get full channel info
    axios.get(`http://localhost:5050/api/channel/${user.channelId}`)
      .then(res => {
        setChannel(res.data);                // Save channel info to state
        setVideos(res.data.videos || []);    // Extract videos from channel object
      })
      .catch(err => {
        setError("Failed to load channel."); // Show error if request fails
      })
      .finally(() => setLoading(false));     // Always stop loading spinner
  }, [user?.channelId]);

  // Constants and logic for description expand/collapse
  const descLimit = 180; // Limit character count for collapsed description
  const showMore = channel && channel.description && channel.description.length > descLimit;
  const descToShow = channel && channel.description
    ? (descExpanded ? channel.description : channel.description.slice(0, descLimit))
    : "";

  // Handle delete request for a specific video
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video?")) return; // Confirm deletion

    try {
      // API call to delete video by ID with authorization
      await axios.delete(`http://localhost:5050/api/video/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Update UI by removing deleted video from state
      setVideos(videos => videos.filter(v => v._id !== id));
      setMenuOpen(null); // Close meatball menu
    } catch (error) {
      console.log(error);
      
      alert("Failed to delete video"); // Show alert if delete fails
    }
  };

  // Open upload modal and reset form
  const handleUpload = () => {
    setForm(initialForm);  // Clear previous form data
    setShowUpload(true);   // Open upload modal
  };

  // Open edit modal for a specific video
  const handleEdit = (id) => {
    const video = videos.find(v => v._id === id); // Find video by ID
    if (video) {
      // Pre-fill form with existing video data
      setEditVideo(video);
      setForm({
        title: video.title || '',
        videoLink: video.videoLink || '',
        thumbnail: video.thumbnail || '',
        description: video.description || '',
        category: video.category || ''
      });
      setShowEdit(true); // Open edit modal
    }
    setMenuOpen(null); // Close meatball menu
  };









  // Function to handle video upload
const handleUploadSubmit = async (e) => {
  e.preventDefault(); // Prevent form from submitting the traditional way
  setFormLoading(true); // Show loading indicator while uploading

  // Trim whitespace from form fields to ensure clean input
  const trimmed = {
    title: form.title.trim(),
    videoLink: form.videoLink.trim(),
    thumbnail: form.thumbnail.trim(),
    description: form.description.trim(),
    category: form.category.trim()
  };

  // Validate that required fields are filled
  if (!trimmed.title || !trimmed.videoLink || !trimmed.thumbnail) {
    alert("Please fill in all required fields.");
    setFormLoading(false); // Stop loading if validation fails
    return;
  }

  // Try uploading the video using API
  try {
    await axios.post(
      "http://localhost:5050/api/video", // Backend API endpoint to upload video
      trimmed, // Payload
      { headers: { Authorization: `Bearer ${user.token}` } } // Send JWT token for authentication
    );

    // After successful upload, fetch updated channel info to refresh UI
    const res = await axios.get(`http://localhost:5050/api/channel/${user.channelId}`);
    setChannel(res.data); // Update channel state
    setVideos(res.data.videos || []); // Update videos list
    setShowUpload(false); // Close upload modal
    setForm(initialForm); // Reset form fields
  } catch (err) {
    // Show alert if something goes wrong
    alert("Failed to upload video: " + (err.response?.data?.message || err.message));
  } finally {
    setFormLoading(false); // Always stop loading at the end
  }
};

// Function to handle video edit
const handleEditSubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission
  if (!editVideo) return; // If there's no video to edit, exit
  setFormLoading(true); // Show loading spinner

  // Trim input fields before sending
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

  // Try sending PUT request to update the video
  try {
    await axios.put(
      `http://localhost:5050/api/video/${editVideo._id}`, // Target video ID
      trimmed,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    // Refresh channel data after editing
    const res = await axios.get(`http://localhost:5050/api/channel/${user.channelId}`);
    setChannel(res.data);
    setVideos(res.data.videos || []);
    setShowEdit(false); // Close edit modal
    setEditVideo(null); // Clear edit state
    setForm(initialForm); // Reset form fields
  } catch (err) {
    alert("Failed to update video: " + (err.response?.data?.message || err.message));
  } finally {
    setFormLoading(false);
  }
};

// Prepare channel form with existing values before showing the edit modal
const openEditChannelModal = () => {
  setChannelEditForm({
    channelName: channel.channelName || "",
    channelBanner: channel.channelBanner || "",
    channelPic: channel.channelPic || "",
    description: channel.description || ""
  });
  setShowEditChannel(true); // Open channel edit modal
};

// Handle channel form field updates (controlled input)
const handleChannelEditChange = (e) => {
  setChannelEditForm({ ...channelEditForm, [e.target.name]: e.target.value });
};

// Save edited channel details
const handleChannelEditSave = async (e) => {
  e.preventDefault(); // Prevent form reload
  setChannelEditLoading(true); // Show loading

  // Trim input fields
  const trimmed = {
    channelName: channelEditForm.channelName.trim(),
    channelBanner: channelEditForm.channelBanner.trim(),
    channelPic: channelEditForm.channelPic.trim(),
    description: channelEditForm.description.trim()
  };

  // Validate required channel name
  if (!trimmed.channelName) {
    alert("Channel name is required.");
    setChannelEditLoading(false);
    return;
  }

  // Try sending updated channel data to backend
  try {
    await axios.put(
      `http://localhost:5050/api/updateChannel/${channel._id}`, // Endpoint with channel ID
      trimmed,
      { headers: { Authorization: `Bearer ${user.token}` } } // Auth header
    );

    // Refresh channel state after update
    const res = await axios.get(`http://localhost:5050/api/channel/${user.channelId}`);
    setChannel(res.data);
    setShowEditChannel(false); // Close modal
  } catch (err) {
    alert("Failed to update channel: " + (err.response?.data?.message || err.message));
  } finally {
    setChannelEditLoading(false); // Stop loading
  }
};

// Handle form field updates for video upload/edit forms
const handleFormChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

// Conditional rendering based on loading or error states
if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
if (!channel) return null; // If channel is not available, render nothing

  return (
    <div className="channel-page" style={{ flex: 1 }}>

      {/* Channel Edit Modal ------------------------------------------------- */}
      {showEditChannel && (
        <div className="edit-channel-modal-bg">
          <div className="edit-channel-modal">
            <h2 className="edit-channel-title">Edit Channel Details</h2>
            <form className="edit-channel-form" onSubmit={handleChannelEditSave}>
              <label className="edit-channel-label">Channel Name</label>
              <input
                className="edit-channel-input"
                name="channelName"
                type="text"
                placeholder="Channel name"
                value={channelEditForm.channelName}
                onChange={handleChannelEditChange}
                required
                autoFocus
              />
              <label className="edit-channel-label">Description</label>
              <textarea
                className="edit-channel-input"
                name="description"
                placeholder="Channel description"
                value={channelEditForm.description}
                onChange={handleChannelEditChange}
                rows={3}
              />
              <label className="edit-channel-label">Banner URL</label>
              <input
                className="edit-channel-input"
                name="channelBanner"
                type="url"
                placeholder="Banner image URL"
                value={channelEditForm.channelBanner}
                onChange={handleChannelEditChange}
              />
              <img
                src={channelEditForm.channelBanner || "https://placehold.co/600x150.png?text=Banner"}
                alt="Banner preview"
                className="edit-channel-banner-preview"
              />
              <label className="edit-channel-label">Channel Picture URL</label>
              <input
                className="edit-channel-input"
                name="channelPic"
                type="url"
                placeholder="Channel picture URL"
                value={channelEditForm.channelPic}
                onChange={handleChannelEditChange}
              />
              <img
                src={channelEditForm.channelPic || "https://placehold.co/100x100.png?text=channel"}
                alt="Avatar preview"
                className="edit-channel-avatar-preview"
              />
              <div className="edit-channel-actions">
                <button
                  type="button"
                  className="edit-channel-cancel"
                  onClick={() => setShowEditChannel(false)}
                  disabled={channelEditLoading}
                >
                  <MdClose style={{ marginRight: 6 }} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="edit-channel-save"
                  disabled={channelEditLoading || !channelEditForm.channelName}
                >
                  <MdSave style={{ marginRight: 6 }} />
                  {channelEditLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal ------------------------------------------------- */}
      {showUpload && (
        <div className="create-channel-modal-bg" style={{ zIndex: 3000 }}>
          <div className="create-channel-modal" style={{ maxWidth: 500 }}>
            <h2 className="create-channel-title">Upload Video</h2>
            <form className="create-channel-form" onSubmit={handleUploadSubmit}>
              <div className="create-channel-fields">
                <label className="create-channel-label">Title</label>
                <input
                  className="create-channel-input"
                  name="title"
                  type="text"
                  placeholder="Video title"
                  value={form.title}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  required
                />
                <label className="create-channel-label">Thumbnail URL</label>
                <input
                  className="create-channel-input"
                  name="thumbnail"
                  type="url"
                  placeholder="Thumbnail image URL"
                  value={form.thumbnail}
                  onChange={handleFormChange}
                  required
                />
                <label className="create-channel-label">Description</label>
                <textarea
                  className="create-channel-input"
                  name="description"
                  placeholder="Video description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                />
                <label className="create-channel-label">Category</label>
                <input
                  className="create-channel-input"
                  name="category"
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleFormChange}
                />
              </div>
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

      {/* Edit Modal --------------------------------------------------- */}
      {showEdit && (
        <div className="create-channel-modal-bg" style={{ zIndex: 3000 }}>
          <div className="create-channel-modal" style={{ maxWidth: 500 }}>
            <h2 className="create-channel-title">Edit Video</h2>
            <form className="create-channel-form" onSubmit={handleEditSubmit}>
              <div className="create-channel-fields">
                <label className="create-channel-label">Title</label>
                <input
                  className="create-channel-input"
                  name="title"
                  type="text"
                  placeholder="Video title"
                  value={form.title}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  required
                />
                <label className="create-channel-label">Thumbnail URL</label>
                <input
                  className="create-channel-input"
                  name="thumbnail"
                  type="url"
                  placeholder="Thumbnail image URL"
                  value={form.thumbnail}
                  onChange={handleFormChange}
                  required
                />
                <label className="create-channel-label">Description</label>
                <textarea
                  className="create-channel-input"
                  name="description"
                  placeholder="Video description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={2}
                />
                <label className="create-channel-label">Category</label>
                <input
                  className="create-channel-input"
                  name="category"
                  type="text"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleFormChange}
                />
              </div>
              <div className="create-channel-actions">
                <button
                  type="button"
                  className="create-channel-cancel"
                  onClick={() => { setShowEdit(false); setEditVideo(null); }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="create-channel-submit"
                  disabled={!form.title || !form.videoLink || !form.thumbnail || formLoading}
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* channel page actually starts here ----------------------------------------------- */}
      <div className="channel-banner-container">
        <img
          className="channel-banner"
          src={channel.channelBanner || "https://placehold.co/600x150.png?text=Banner"}
          alt="Channel banner"
        />
      </div>
      <div className="channel-header">
        <img className="channel-avatar" src={channel.channelPic || "https://placehold.co/100x100.png?text=channel"} alt={channel.channelName} />
        <div className="channel-info">
          <div className="channel-title">{channel.channelName}</div>
          <div className="channel-meta">
            <span className="channel-handle">@{channel.channelName?.toLowerCase().replace(/\s/g, '')}-ic4ou</span>
            <span className="channel-dot">·</span>
            <span className="channel-subs">{channel.subscribers} subscribers</span>
            <span className="channel-dot">·</span>
            <span className="channel-videos">{videos.length} videos</span>
          </div>
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
            <button className="channel-btn" onClick={handleUpload}>
              <MdUpload style={{ marginRight: 6, fontSize: "1.2rem" }} />
              Upload video
            </button>
            <button className="channel-btn" onClick={openEditChannelModal}>
              Customize channel
            </button>
            <button className="channel-btn secondary">Manage videos</button>
          </div>
        </div>
      </div>
      <div className="channel-tabs">
        <div className="channel-tab">Home</div>
        <div className="channel-tab active">Videos</div>
        <div className="channel-tab">Shorts</div>
        <div className="channel-tab">Playlists</div>
        <div className="channel-tab">Posts</div>
      </div>
      <div className="channel-videos-list">

        {/* map over videos array state to render video cards on channel */}
        {videos.map(video => (
          <div className="channel-video-card" key={video._id}>
            <Link to={`/video/${video._id}`}>
              <img className="channel-video-thumb" src={video.thumbnail} alt={video.title} />
            </Link>
            <div className="channel-video-info">
              <div className="channel-video-title">{video.title}</div>
              <div className="channel-video-meta">
                <span>{video.views} views</span>
                <span className="channel-dot">·</span>
                <span>{video.uploadDate? new Date(video.uploadDate).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric"}): ""}</span>
              </div>
            </div>
            <div className="channel-video-actions">
              <span
                className="channel-video-meatball"
                tabIndex={0}
                onClick={() => setMenuOpen(menuOpen === video._id ? null : video._id)}
              >

                {/* meatball icons for editing and deleting video */}
                <BsThreeDotsVertical />
                {menuOpen === video._id && (
                  <div className="channel-video-dropdown">
                    <button className="channel-video-dropdown-item" onClick={() => handleEdit(video._id)}>
                      <MdEdit style={{ marginRight: 6 }} /> Edit
                    </button>
                    <button className="channel-video-dropdown-item delete" onClick={() => handleDelete(video._id)}>
                      <MdDelete style={{ marginRight: 6 }} /> Delete
                    </button>
                  </div>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default YourChannel // export yourChannel component