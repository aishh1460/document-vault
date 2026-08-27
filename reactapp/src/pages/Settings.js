import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import * as authService from '../services/authService';

const Settings = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      toastError('Username and email are required');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      toastError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.updateProfile(currentUser.userId, {
        username: username.trim(),
        email: email.trim(),
        password: newPassword || undefined,
      });
      updateUserProfile({
        ...currentUser,
        username: res.data.username,
        email: res.data.email,
      });
      success('Profile updated successfully');
      setNewPassword('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ⚙️ Vault Settings & Profile
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Manage your account profile, security credentials, and interface preferences
        </p>
      </div>

      {/* Account Info Card */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Account & Credentials
        </h3>

        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Username
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
              Change Password (Leave blank to keep unchanged)
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: '6px' }}>
            <div className="glass-card" style={{ padding: '10px 14px', maxWidth: '300px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Account Role</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{currentUser?.role}</strong>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: 'fit-content', padding: '8px 20px', marginTop: '8px' }}
          >
            Save Profile Changes
          </Button>
        </form>
      </div>

      {/* Preferences Card */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          Display & Appearance
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Theme Mode</span>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Currently active: <strong>{theme === 'dark' ? 'Dark Glassmorphic' : 'Light Clean'}</strong>
            </p>
          </div>

          <Button variant="secondary" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
