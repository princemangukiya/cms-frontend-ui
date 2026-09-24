import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/forgot-password",
        formData
      );

      setMessage(
        typeof response.data === 'string'
          ? response.data
          : "Password updated successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.response && err.response.data) {
        setError(
          typeof err.response.data === 'string'
            ? err.response.data
            : "User not found with this email"
        );
      } else {
        setError("Server Connection Error / Server down!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Ambient background glow orbs */}
      <div className="auth-glow-orb-1" />
      <div className="auth-glow-orb-2" />

      <div className="auth-card-wrapper">
        <div className="auth-card">
          {/* Brand Header */}
          <div className="auth-brand">
            <div className="auth-icon-badge">
              <FaGraduationCap size={28} color="#ffffff" />
            </div>
            <h1 className="auth-brand-title">CollegePortal</h1>
            <p className="auth-brand-subtitle">Campus Management System</p>
          </div>

          <div className="auth-divider" />

          <h2 className="auth-form-title">Forgot Password</h2>
          <p className="auth-form-desc">Enter your registered email and new password</p>

          {/* Success Message Banner */}
          {message && (
            <div className="auth-banner-success">
              <FaCheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{message}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="auth-banner-error">
              <FaExclamationCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="auth-form" autoComplete="off">
            {/* Email Input */}
            <div className="auth-field-group">
              <label className="auth-label">Registered Email</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="e.g. student@college.edu"
                />
              </div>
            </div>

            {/* New Password Input */}
            <div className="auth-field-group">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrapper">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Updating...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Back to Login Link */}
            <div className="auth-footer">
              <span>Remember your password?</span>
              <Link to="/" className="auth-link-primary">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;