import React, { useState } from 'react';
import * as authService from '../services/authService';

export const Login = ({ onLoginSuccess, onToggleRegister }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { usernameOrEmail, password };
      if (mfaRequired) {
        payload.mfaToken = mfaToken;
      }

      const response = await authService.login(payload);
      const data = response.data; 

      if (data.mfaRequired && !mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      
      localStorage.setItem('vault_token', data.token);
      localStorage.setItem('vault_user', JSON.stringify({
        userId: data.userId,
        username: data.username,
        role: data.role,
      }));

      
      const profileRes = await authService.getProfile(data.userId);
      const fullUser = {
        ...data,
        mfaEnabled: profileRes.data.mfaEnabled,
        email: profileRes.data.email
      };
      localStorage.setItem('vault_user', JSON.stringify(fullUser));

      if (onLoginSuccess) {
        onLoginSuccess(fullUser);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || '';
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 8080.');
      } else if (err.response.status === 403) {
        setError('Account is locked or suspended. Contact your administrator.');
      } else if (err.response.status === 400 || err.response.status === 401) {
        setError('Invalid username/email or password. Please try again.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="text-center mb-6">
        <h2 className="brand mb-2" style={{ justifyContent: 'center' }}>
          <span className="brand-icon">🔒</span> Digital Vault
        </h2>
        <p className="text-muted">Enter credentials to authenticate session</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!mfaRequired ? (
          <>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-input"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label className="form-label">MFA Verification Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-digit authenticator code"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              required
            />
            <p className="text-muted text-sm mt-2">
              Multi-Factor Authentication is enabled on your account.
            </p>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Authenticating...' : mfaRequired ? 'Verify & Login' : 'Login'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm">
        <span className="text-muted">New user? </span>
        <span className="text-primary font-semibold cursor-pointer" onClick={onToggleRegister} style={{ textDecoration: 'underline' }}>
          Register Security Account
        </span>
      </div>
    </div>
  );
};

export const Register = ({ onRegisterSuccess, onToggleLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  
  const parseError = (err) => {
    const data = err.response?.data;
    if (!data) return 'Registration failed. Please try again.';

    
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(e => e.defaultMessage || e.message || e).join(', ');
    }
    if (Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
      return data.fieldErrors.map(e => `${e.field}: ${e.defaultMessage}`).join(', ');
    }
    
    if (data.message && !data.message.toLowerCase().includes('validation failed for object')) {
      return data.message;
    }
    
    if (data.message) {
      return 'Validation failed. Please check: username (min 3 chars), password (min 8 chars), valid email.';
    }
    return 'Registration failed. Please check your input and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (username.trim().length > 50) {
      setError('Username must be at most 50 characters long.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = { username: username.trim(), email: email.trim(), password };
      await authService.register(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else {
          onToggleLogin();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '3rem auto' }}>
      <div className="text-center mb-6">
        <h2 className="brand mb-2" style={{ justifyContent: 'center' }}>
          <span className="brand-icon">🔑</span> Security Enrolment
        </h2>
        <p className="text-muted">Register a new profile in the cryptographically secure vault</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderLeft: '4px solid #10b981', borderRadius: '8px', padding: '0.75rem 1rem', color: '#6ee7b7', fontSize: '0.875rem', marginBottom: '1rem' }}>
          ✅ Enrolment successful! Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid-cols-2">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Security Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading || success}>
          {loading ? 'Registering Security Profile...' : 'Complete Enrolment'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm">
        <span className="text-muted">Already registered? </span>
        <span className="text-primary font-semibold cursor-pointer" onClick={onToggleLogin} style={{ textDecoration: 'underline' }}>
          Back to Authentication
        </span>
      </div>
    </div>
  );
};

export const MfaSetup = ({ userId, onMfaStatusChange, onClose }) => {
  const [secretKey] = useState(() => {
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let key = '';
    for (let i = 0; i < 16; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.setupMfa(userId, {
        secretKey,
        verificationCode,
        enable: true
      });
      setSuccess('MFA successfully enabled! Use your authenticator app on next login.');
      if (onMfaStatusChange) {
        onMfaStatusChange(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification code failed. Please check your time synchronization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ position: 'relative' }}>
      {onClose && <button className="modal-close" onClick={onClose}>&times;</button>}
      <h3 className="mb-4">🛡️ Setup Multi-Factor Authentication</h3>

      {error && <div className="badge badge-deleted w-full mb-4 text-center" style={{ padding: '0.6rem' }}>{error}</div>}
      {success && <div className="badge badge-active w-full mb-4 text-center" style={{ padding: '0.6rem' }}>{success}</div>}

      {!success && (
        <form onSubmit={handleEnableMfa} className="flex flex-col gap-4">
          <p className="text-muted text-sm">
            To secure your account, scan the barcode or enter the secret key into your authenticator app (Google Authenticator, Microsoft Authenticator, etc.).
          </p>

          <div style={{ background: '#fff', padding: '1rem', width: '180px', height: '180px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
            {}
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <rect width="100" height="100" fill="white"/>
              {}
              <rect x="10" y="10" width="20" height="20" fill="black"/>
              <rect x="13" y="13" width="14" height="14" fill="white"/>
              <rect x="16" y="16" width="8" height="8" fill="black"/>

              <rect x="70" y="10" width="20" height="20" fill="black"/>
              <rect x="73" y="13" width="14" height="14" fill="white"/>
              <rect x="76" y="16" width="8" height="8" fill="black"/>

              <rect x="10" y="70" width="20" height="20" fill="black"/>
              <rect x="13" y="73" width="14" height="14" fill="white"/>
              <rect x="16" y="76" width="8" height="8" fill="black"/>
              
              {}
              <rect x="35" y="35" width="30" height="30" fill="black" opacity="0.8"/>
              <rect x="38" y="38" width="10" height="10" fill="white"/>
              <rect x="52" y="52" width="10" height="10" fill="white"/>
              <rect x="35" y="15" width="25" height="10" fill="black"/>
              <rect x="70" y="35" width="15" height="25" fill="black"/>
            </svg>
          </div>

          <div className="form-group">
            <label className="form-label">Secret Key (Manual Entry)</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="form-input text-center"
                style={{ fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 'bold' }}
                value={secretKey}
                readOnly
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Authenticator 6-Digit Code</label>
            <input
              type="text"
              className="form-input text-center"
              style={{ fontSize: '1.25rem', letterSpacing: '4px' }}
              placeholder="000000"
              maxLength="6"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Activating security protocols...' : 'Enable Multi-Factor Authentication'}
          </button>
        </form>
      )}
    </div>
  );
};
