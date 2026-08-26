import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const Login = ({ onToggleRegister }) => {
  const { loginUser, loginAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!usernameOrEmail.trim()) {
      errs.usernameOrEmail = 'Username or email is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isAdminMode) {
        await loginAdmin({ usernameOrEmail: usernameOrEmail.trim(), password });
        success('Admin session authenticated successfully');
      } else {
        await loginUser({ usernameOrEmail: usernameOrEmail.trim(), password });
        success('User authenticated successfully');
      }
    } catch (err) {
      const msg = err.response?.data?.message || (isAdminMode ? 'Invalid admin credentials' : 'Invalid username or password');
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '18px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🛡️</div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Digital Document Vault
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isAdminMode ? 'Administrator Security Portal' : 'Secure Document Repository Sign In'}
          </p>
        </div>

        {/* Portal Switch Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setErrors({});
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: !isAdminMode ? 'var(--primary-color)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            👤 User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setErrors({});
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: isAdminMode ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            🔐 Admin Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Username or Email
            </label>
            <input
              type="text"
              className={`form-input ${errors.usernameOrEmail ? 'input-error' : ''}`}
              placeholder="Enter username or email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              style={{ width: '100%' }}
            />
            {errors.usernameOrEmail && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.usernameOrEmail}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>
              Password
            </label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
            />
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant={isAdminMode ? 'danger' : 'primary'}
            loading={loading}
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {isAdminMode ? 'Authenticate as Admin' : 'Sign In to Vault'}
          </Button>

          {!isAdminMode && onToggleRegister && (
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onToggleRegister}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Register Here
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
