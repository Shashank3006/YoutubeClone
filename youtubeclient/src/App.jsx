import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Header from './components/Header.jsx';
import SideNavBar from './components/SideNavBar.jsx';
import { Outlet } from 'react-router-dom';
import './App.css';

// Main layout for the app
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchedVal, setSearchedVal] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 792;

  // Dynamic styling for content margin
  const mainContentStyle = {
    marginLeft: isMobile ? 0 : (sidebarOpen ? 220 : 72),
    transition: isMobile ? 'none' : 'margin-left 0.2s cubic-bezier(.4,0,.2,1)',
  };

  // Handle search trigger
  const handleSearch = useCallback(() => {
    setSearchActive(true);
  }, []);

  return (
    <>
      {/* Header component */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchedVal={searchedVal}
        setSearchedVal={setSearchedVal}
        onSearch={handleSearch}
      />

      <div className="app-layout">
        {/* Sidebar */}
        <SideNavBar sidebarOpen={sidebarOpen} isMobile={isMobile} />

        {/* Main content area */}
        <div className="main-content" style={mainContentStyle}>
          {/* Suspense fallback for lazy-loaded nested routes */}
          <Suspense fallback={<div style={{ padding: 20 }}>Loading page...</div>}>
            <Outlet context={{
              sidebarOpen,
              searchedVal,
              setSearchedVal,
              searchActive,
              setSearchActive
            }} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

export default App;
