import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';

const Register = ({ onToggleLogin, onRegisterSuccess }) => {
  const { registerUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VIEWER',
    securityClearance: 'PUBLIC',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      errs.username = 'Username must be between 3 and 50 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'A valid email address is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        securityClearance: formData.securityClearance,
      });
      success('Account created successfully! Please sign in.');
      if (onRegisterSuccess) onRegisterSuccess();
      else if (onToggleLogin) onToggleLogin();
    } catch (err) {
      const fieldErrs = err.response?.data?.fieldErrors;
      if (fieldErrs) {
        setErrors(fieldErrs);
      }
      const msg = err.response?.data?.message || 'Registration failed';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordLongEnough = formData.password.length >= 8;

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '18px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛡️</div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Create Vault Account
          </h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Register to securely ingest and store confidential documents
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
              Username <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="username"
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="3–50 characters"
              value={formData.username}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            {errors.username && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                {errors.username}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
              Email Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="name@organization.com"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 8 chars"
                value={formData.password}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Password length indicator */}
          <div style={{ fontSize: '0.75rem', color: isPasswordLongEnough ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{isPasswordLongEnough ? '✓' : 'ℹ'}</span>
            <span>Password length: {formData.password.length}/8 characters minimum</span>
          </div>

          {errors.password && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.password}</span>
          )}
          {errors.confirmPassword && (
            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.confirmPassword}</span>
          )}

          {/* Role and Clearance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Security Role
              </label>
              <select
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <option value="VIEWER">VIEWER</option>
                <option value="COLLABORATOR">COLLABORATOR</option>
                <option value="MANAGER">MANAGER</option>
                <option value="VAULT_OWNER">VAULT_OWNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                Clearance Level
              </label>
              <select
                name="securityClearance"
                className="form-input"
                value={formData.securityClearance}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
                <option value="TOP_SECRET">TOP_SECRET</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            Create Account
          </Button>

          {onToggleLogin && (
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={onToggleLogin}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Sign In Here
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
