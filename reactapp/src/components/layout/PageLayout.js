import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './LineSidebar';
import FolderTransition from './FolderTransition';

const navigationItems = ['Dashboard', 'All Documents', 'Folders', 'Favorites', 'Secure Shares', 'Recent Activity', 'Reminders', 'Trash', 'Settings'];
const pageKeys = ['dashboard', 'documents', 'folders', 'favorites', 'shared', 'recent', 'reminders', 'trash', 'settings'];

const PageLayout = ({ children, activePage, setActivePage, onSearch, searchQuery, setSearchQuery }) => {
  const [showFolderTransition, setShowFolderTransition] = useState(false);
  const [transitionPage, setTransitionPage] = useState(null);
  const effectiveActivePage = transitionPage || activePage;
  const activeIndex = pageKeys.indexOf(effectiveActivePage);

  const handleSidebarClick = index => {
    const page = pageKeys[index];
    if (!page) return;

    if (page === 'folders' && activePage !== 'folders') {
      setTransitionPage('folders');
      setShowFolderTransition(true);
      return;
    }

    setTransitionPage(null);
    setActivePage(page);
  };

  const handleFolderTransitionComplete = () => {
    setShowFolderTransition(false);
    setTransitionPage(null);
    setActivePage('folders');
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activePage={effectiveActivePage} setActivePage={setActivePage} onSearch={onSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="main-container" style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%', flex: 1, boxSizing: 'border-box' }}>
        <aside className="vault-sidebar-container" style={{ width: '220px', minWidth: '220px', flexShrink: 0 }}>
          <div style={{ padding: '4px 0 16px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(247, 242, 232, 0.28)' }}>
            VAULT EXPLORER
          </div>

          <Sidebar
            items={navigationItems}
            activeIndex={activeIndex >= 0 ? activeIndex : 0}
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
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;