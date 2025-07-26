import React from 'react'
import VideoList from '../components/VideoList.jsx' // import videoList to show on homePage
import { useOutletContext } from 'react-router-dom' // import outlet to get sideBar state
import '../style/homePage.css' // import css for styling

// Homepage: shows video list and handles sidebar state
function Homepage() {
  const { sidebarOpen } = useOutletContext();

  return (
    <div className='homepage'>
        <VideoList sidebarOpen={sidebarOpen} /> {/* call VideoList from here and send sideBar prop */}
    </div>
  )
}

export default Homepage; // export homepage component page