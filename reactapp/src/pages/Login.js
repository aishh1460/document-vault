import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import './Login.css';

const Login = ({ initialAdminMode = false, onToggleRegister }) => {
  const { loginUser, loginAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [isAdminMode, setIsAdminMode] = useState(initialAdminMode);
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
        await loginAdmin({
          usernameOrEmail: usernameOrEmail.trim(),
          password,
        });

        success('Admin session authenticated successfully');
      } else {
        await loginUser({
          usernameOrEmail: usernameOrEmail.trim(),
          password,
        });

        success('User authenticated successfully');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (
          isAdminMode
            ? 'Invalid admin credentials'
            : 'Invalid username or password'
        );

      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-shell">

        {}
        {}
        {}

        <section className="auth-visual">

          <img
            src="/images/loginpic.png"
            alt="Secure digital document vault"
            className="auth-visual-image"
          />

          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">

            <div className="auth-visual-badge">
              <span className="auth-badge-dot" />
              SECURE DIGITAL STORAGE
            </div>

            <div className="auth-visual-text">

              <h1>
                Your documents.
                <br />
                <span>Protected by design.</span>
              </h1>

              <p>
                A private space to store, organize and
                securely access everything that matters.
              </p>

            </div>

            <div className="auth-visual-footer">

              <div className="auth-mini-stat">
                <strong>PRIVATE</strong>
                <span>Your data, your control</span>
              </div>

              <div className="auth-mini-divider" />

              <div className="auth-mini-stat">
                <strong>SECURE</strong>
                <span>Built for your documents</span>
              </div>

            </div>

          </div>

        </section>

        {}
        {}
        {}

        <section className="auth-form-panel">

          <div className="auth-form-container">

            {}

            <div className="auth-brand">

              <div className="auth-brand-icon">
                V
              </div>

              <div>
                <div className="auth-brand-name">
                  Vault
                </div>

                <div className="auth-brand-subtitle">
                  DIGITAL DOCUMENT VAULT
                </div>
              </div>

            </div>

            {}

            <div className="auth-header">

              <div className="auth-security-icon">
                {isAdminMode ? '🔐' : '🛡️'}
              </div>

              <h2>
                {isAdminMode
                  ? 'Administrator Portal'
                  : 'Welcome back'}
              </h2>

              <p>
                {isAdminMode
                  ? 'Authenticate to access administrative controls'
                  : 'Sign in to access your secure document vault'}
              </p>

            </div>

            {}

            <div className="auth-tabs">

              <button
                type="button"
                className={!isAdminMode ? 'active' : ''}
                onClick={() => {
                  setIsAdminMode(false);
                  setErrors({});
                }}
              >
                <span>👤</span>
                User Login
              </button>

              <button
                type="button"
                className={isAdminMode ? 'active admin' : ''}
                onClick={() => {
                  setIsAdminMode(true);
                  setErrors({});
                }}
              >
                <span>🔐</span>
                Admin Portal
              </button>

            </div>

            {}

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              {}

              <div className="auth-field">

                <label>
                  Username or Email
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    @
                  </span>

                  <input
                    type="text"
                    placeholder="Enter username or email"
                    value={usernameOrEmail}
                    onChange={(e) =>
                      setUsernameOrEmail(e.target.value)
                    }
                    className={
                      errors.usernameOrEmail
                        ? 'error'
                        : ''
                    }
                  />

                </div>

                {errors.usernameOrEmail && (
                  <span className="auth-error">
                    {errors.usernameOrEmail}
                  </span>
                )}

              </div>

              {}

              <div className="auth-field">

                <label>
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    •••
                  </span>

                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className={
                      errors.password
                        ? 'error'
                        : ''
                    }
                  />

                </div>

                {errors.password && (
                  <span className="auth-error">
                    {errors.password}
                  </span>
                )}

              </div>

              {}

              <Button
                type="submit"
                variant={isAdminMode ? 'danger' : 'primary'}
                loading={loading}
                className="auth-submit-button"
              >
                {isAdminMode
                  ? 'Authenticate as Admin'
                  : 'Sign In to Vault'}
              </Button>

              {}
              {onToggleRegister && (
                <div className="auth-register">
                  <span>
                    {isAdminMode ? 'Need an admin account?' : "Don't have an account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleRegister(isAdminMode)}
                  >
                    {isAdminMode ? 'Register as Admin' : 'Create your vault'}
                  </button>
                </div>
              )}

            </form>

            {}

            <div className="auth-security-note">

              <span>◈</span>

              <div>
                <strong>Private & secure</strong>
                <p>
                  Your documents remain protected
                  inside your personal vault.
                </p>
              </div>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default Login;