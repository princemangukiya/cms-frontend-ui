import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGraduationCap } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    emailId: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        {
          emailId: loginData.emailId,
          password: loginData.password
        }
      );

      localStorage.setItem("token", response.data.token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (response.data.user.profile_pic) {
          localStorage.setItem("userProfilePic", response.data.user.profile_pic);
        } else {
          localStorage.removeItem("userProfilePic");
        }
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login request failed:", error);
      if (error.response) {
        alert(
          typeof error.response.data === 'string'
            ? error.response.data
            : "Invalid Email or Password!"
        );
      } else {
        alert("Server Connection Error / CORS Blocked!");
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

          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-desc">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin} className="auth-form">
            {/* Email Field */}
            <div className="auth-field-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  name="emailId"
                  value={loginData.emailId}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="e.g. student@college.edu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="auth-row-between">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={loginData.rememberMe}
                  onChange={handleChange}
                  className="auth-checkbox"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link-forgot">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Register Link */}
            <div className="auth-footer">
              <span>Don't have an account?</span>
              <Link to="/register" className="auth-link-primary">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;       