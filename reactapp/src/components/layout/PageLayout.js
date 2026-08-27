import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './LineSidebar';
import FolderTransition from './FolderTransition';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'All Documents', path: '/documents' },
  { name: 'Folders', path: '/folders' },
  { name: 'Favorites', path: '/favorites' },
  { name: 'Secure Shares', path: '/shared' },
  { name: 'Recent Activity', path: '/recent' },
  { name: 'Reminders', path: '/reminders' },
  { name: 'Trash', path: '/trash' },
  { name: 'Settings', path: '/settings' },
];

const PageLayout = ({ children, activePage, setActivePage, onSearch, searchQuery, setSearchQuery }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFolderTransition, setShowFolderTransition] = useState(false);

  
  const currentPathIndex = navigationItems.findIndex(
    (item) => item.path === location.pathname || (item.path === '/dashboard' && location.pathname === '/')
  );
  const activeIndex = currentPathIndex >= 0 ? currentPathIndex : 0;

  const handleSidebarClick = (e, index, item) => {
    const targetPath = typeof item === 'object' ? item.path : `/${item.toLowerCase().replace(/\s+/g, '-')}`;

    if (targetPath === '/folders' && location.pathname !== '/folders') {
      if (e && e.preventDefault) e.preventDefault();
      setShowFolderTransition(true);
      return;
    }

    if (setActivePage && typeof item === 'object') {
      const pageKey = item.path.replace('/', '');
      setActivePage(pageKey);
    }
  };

  const handleFolderTransitionComplete = () => {
    setShowFolderTransition(false);
    if (setActivePage) setActivePage('folders');
    navigate('/folders');
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onSearch={onSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div
        className="main-container"
        style={{
          display: 'flex',
          gap: '24px',
          padding: '24px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          flex: 1,
          boxSizing: 'border-box',
        }}
      >
        <aside className="vault-sidebar-container" style={{ width: '220px', minWidth: '220px', flexShrink: 0 }}>
          <div
            style={{
              padding: '4px 0 16px',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'rgba(247, 242, 232, 0.28)',
            }}
          >
            VAULT EXPLORER
          </div>

          <Sidebar
            items={navigationItems}
            activeIndex={activeIndex}
            accentColor="#8FE3CF"
            textColor="#8A8F9C"
            markerColor="#444650"
            proximityRadius={120}
            maxShift={18}
            markerLength={54}
            markerGap={18}
            itemGap={8}
            showIndex={true}
            showMarker={true}
            fontSize={0.95}
            smoothing={70}
            onItemClick={handleSidebarClick}
          />
        </aside>

        <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          {showFolderTransition ? (
            <FolderTransition onComplete={handleFolderTransitionComplete} duration={1450} />
          ) : (
            children || <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;