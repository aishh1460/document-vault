import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import * as notificationService from '../../services/notificationService';
import ConfirmModal from '../common/ConfirmModal';

const Navbar = ({ onSearch, searchQuery, setSearchQuery, activePage, setActivePage }) => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);

  useEffect(() => {
    if (currentUser?.userId) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotificationsByUser(currentUser.userId);
      const list = res.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead && !n.read).length);
    } catch (e) {
      
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      loadNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(currentUser.userId);
      loadNotifications();
      success('All notifications marked as read');
    } catch (e) {}
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logoutUser();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <header
        className="navbar glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {}
        <NavLink
          to="/dashboard"
          className="brand"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
          onClick={() => setActivePage && setActivePage('dashboard')}
        >
          <span className="brand-icon" style={{ fontSize: '1.5rem' }}>🛡️</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Digital Document Vault System
          </span>
        </NavLink>

        {}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearch) onSearch(searchQuery);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '9999px',
            padding: '4px 12px',
            border: '1px solid rgba(255,255,255,0.15)',
            width: '320px',
            maxWidth: '100%',
          }}
        >
          <span style={{ opacity: 0.6, marginRight: '6px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search documents, tags, OCR..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontSize: '0.85rem',
            }}
          />
        </form>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {}
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'var(--text-primary)',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text-primary)',
              }}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                className="glass-card"
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '12px',
                  zIndex: 200,
                  boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                    No notifications yet
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkRead(n.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: n.isRead || n.read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          borderLeft: n.isRead || n.read ? 'none' : '3px solid var(--primary-color)',
                        }}
                      >
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{n.message}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {}
          {currentUser && (
            <div
              className="user-profile-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.username}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          {}
          <button
            className="btn btn-secondary"
            onClick={() => setShowLogoutConfirm(true)}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
          >
            Logout
          </button>
        </div>
      </header>

      {}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your secure vault session?"
        confirmText="Logout"
        confirmVariant="danger"
      />
    </>
  );
};

export default Navbar;
