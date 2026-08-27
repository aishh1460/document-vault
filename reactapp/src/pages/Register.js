import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import './Register.css';

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
    } else if (
      formData.username.trim().length < 3 ||
      formData.username.trim().length > 50
    ) {
      errs.username = 'Username must be between 3 and 50 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
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

      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else if (onToggleLogin) {
        onToggleLogin();
      }
    } catch (err) {
      const fieldErrs = err.response?.data?.fieldErrors;

      if (fieldErrs) {
        setErrors(fieldErrs);
      }

      const msg =
        err.response?.data?.message || 'Registration failed';

      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordLongEnough = formData.password.length >= 8;

  return (
    <div className="register-page">

      <section className="register-visual">

        <img
          src="/images/registerpic.jfif"
          alt="Secure document vault"
          className="register-visual-image"
        />

        <div className="register-visual-overlay" />

        <div className="register-visual-content">

          <div className="register-visual-eyebrow">
            <span className="register-eyebrow-dot" />
            SECURE • PRIVATE • ORGANIZED
          </div>

          <h1>
            Your documents.
            <br />
            <span>Your vault.</span>
          </h1>

          <p>
            Create your secure digital vault and keep everything
            important protected, organized, and always within reach.
          </p>

          <div className="register-visual-features">

            <div className="register-feature">
              <strong>PRIVATE</strong>
              <span>Your documents, your control</span>
            </div>

            <div className="register-feature">
              <strong>SECURE</strong>
              <span>Built for confidential files</span>
            </div>

          </div>

        </div>

      </section>


      <section className="register-form-section">

        <div className="register-form-wrapper">

          <div className="register-form-header">

            <div className="register-logo">
              <span>V</span>
            </div>

            <h2>
              Create Vault Account
            </h2>

            <p>
              Register to securely ingest and store confidential documents
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            <div className="register-form-group">

              <label>
                Username <span>*</span>
              </label>

              <input
                type="text"
                name="username"
                className={errors.username ? 'register-input input-error' : 'register-input'}
                placeholder="3–50 characters"
                value={formData.username}
                onChange={handleChange}
              />

              {errors.username && (
                <span className="register-error">
                  {errors.username}
                </span>
              )}

            </div>


            <div className="register-form-group">

              <label>
                Email Address <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                className={errors.email ? 'register-input input-error' : 'register-input'}
                placeholder="name@organization.com"
                value={formData.email}
                onChange={handleChange}
              />

              {errors.email && (
                <span className="register-error">
                  {errors.email}
                </span>
              )}

            </div>


            <div className="register-two-column">

              <div className="register-form-group">

                <label>
                  Password <span>*</span>
                </label>

                <input
                  type="password"
                  name="password"
                  className={errors.password ? 'register-input input-error' : 'register-input'}
                  placeholder="Min 8 chars"
                  value={formData.password}
                  onChange={handleChange}
                />

              </div>


              <div className="register-form-group">

                <label>
                  Confirm Password <span>*</span>
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  className={errors.confirmPassword ? 'register-input input-error' : 'register-input'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div
              className={`register-password-status ${
                isPasswordLongEnough ? 'valid' : ''
              }`}
            >
              <span>
                {isPasswordLongEnough ? '✓' : 'ℹ'}
              </span>

              <span>
                Password length: {formData.password.length}/8 characters minimum
              </span>
            </div>


            {errors.password && (
              <span className="register-error register-password-error">
                {errors.password}
              </span>
            )}

            {errors.confirmPassword && (
              <span className="register-error register-password-error">
                {errors.confirmPassword}
              </span>
            )}


            <div className="register-two-column">

              <div className="register-form-group">

                <label>
                  Security Role
                </label>

                <select
                  name="role"
                  className="register-input register-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="VIEWER">
                    VIEWER
                  </option>

                  <option value="COLLABORATOR">
                    COLLABORATOR
                  </option>

                  <option value="MANAGER">
                    MANAGER
                  </option>

                  <option value="VAULT_OWNER">
                    VAULT_OWNER
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>

                </select>

              </div>


              <div className="register-form-group">

                <label>
                  Clearance Level
                </label>

                <select
                  name="securityClearance"
                  className="register-input register-select"
                  value={formData.securityClearance}
                  onChange={handleChange}
                >
                  <option value="PUBLIC">
                    PUBLIC
                  </option>

                  <option value="CONFIDENTIAL">
                    CONFIDENTIAL
                  </option>

                  <option value="SECRET">
                    SECRET
                  </option>

                  <option value="TOP_SECRET">
                    TOP_SECRET
                  </option>

                </select>

              </div>

            </div>


            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '8px',
              }}
            >
              Create Account
            </Button>


            {onToggleLogin && (
              <div className="register-login-link">

                Already registered?

                <button
                  type="button"
                  onClick={onToggleLogin}
                >
                  Sign In Here
                </button>

              </div>
            )}

          </form>


          <div className="register-security-note">

            <div className="security-note-icon">
              ◈
            </div>

            <div>
              <strong>
                Private & Secure
              </strong>

              <span>
                Your documents remain protected inside your personal vault.
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Register;