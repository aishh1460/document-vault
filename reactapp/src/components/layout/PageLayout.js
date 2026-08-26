import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const PageLayout = ({
  children,
  activePage,
  setActivePage,
  onSearch,
  searchQuery,
  setSearchQuery,
}) => {
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
        }}
      >
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
