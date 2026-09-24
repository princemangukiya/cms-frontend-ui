import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaKey,
  FaShieldAlt,
  FaInfoCircle
} from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    emailId: '',
    mobile_no: '',
    password: '',
    role_id: '4', // Default to Student
    authCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 10-Digit Mobile Restriction
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_no") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.emailId)) {
      alert("Please enter a valid email address!");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile_no)) {
      alert("Mobile number must be exactly 10 digits!");
      return;
    }

    if (!formData.role_id) {
      alert("Please choose your role!");
      return;
    }

    const roleIdNum = Number(formData.role_id);
    const getRoleName = (id) => {
      switch (id) {
        case 1: return "HOD";
        case 2: return "Principal";
        case 3: return "Professor";
        case 4: return "Student";
        case 5: return "Librarian";
        case 6: return "Placement Officer";
        default: return "User";
      }
    };

    // 🔒 Real-World College Security:
    // Students can register publicly, but elevated roles require the official authorization key.
    const ROLE_KEYS = {
      1: "HOD@CMS2024",
      2: "PRINCIPAL@CMS2024",
      3: "PROF@CMS2024",
      5: "LIB@CMS2024",
      6: "PLACEMENT@CMS2024"
    };
    const MASTER_KEY = "CMS@ADMIN#SECURE";

    if (roleIdNum !== 4) {
      if (!formData.authCode || formData.authCode.trim() === "") {
        alert(`🔒 Security Alert: Registration as "${getRoleName(roleIdNum)}" requires an official Authorization Code!\n\nPlease enter the authorized security key.`);
        return;
      }

      const enteredKey = formData.authCode.trim();
      const expectedKey = ROLE_KEYS[roleIdNum];
      if (enteredKey !== expectedKey && enteredKey !== MASTER_KEY) {
        alert(`❌ Access Denied: Invalid Authorization Code for ${getRoleName(roleIdNum)}!\n\nIn accordance with college security policies, only authorized personnel possessing the official passcode may create this account.`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Account Register (Sends authCode for backend security verification as well)
      await axios.post('http://localhost:8080/api/users/register', formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      // 2. Direct Auto-Login (Fetch Token & Selected Role)
      const loginRes = await axios.post("http://localhost:8080/api/users/login", {
        emailId: formData.emailId,
        password: formData.password
      });

      if (loginRes.data?.token) {
        localStorage.setItem("token", loginRes.data.token);
      }

      if (loginRes.data?.user) {
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        if (loginRes.data.user.profile_pic) {
          localStorage.setItem("userProfilePic", loginRes.data.user.profile_pic);
        }
      } else {
        const userObj = {
          full_name: formData.full_name,
          fullName: formData.full_name,
          emailId: formData.emailId,
          mobile_no: formData.mobile_no,
          role_id: Number(formData.role_id),
          roleId: Number(formData.role_id)
        };
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      // 3. Navigate to Dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Registration error:", error);
      const serverMsg = error.response?.data?.message || 
                        error.response?.data?.error || 
                        (typeof error.response?.data === 'string' ? error.response.data : "") ||
                        error.message || "";

      // 1. Friendly Duplicate Email Detection
      if (
        serverMsg.toLowerCase().includes("duplicate") ||
        serverMsg.toLowerCase().includes("already registered") ||
        serverMsg.toLowerCase().includes("user_detail.uk") ||
        error.response?.status === 409
      ) {
        alert(
          `⚠️ Account Already Exists!\n\nThe email address "${formData.emailId}" is already registered in our college portal.\n\nPlease click "Sign In" to log in, or use a different email address.`
        );
        return;
      }

      // 2. Security Authorization Failure
      if (
        serverMsg.toLowerCase().includes("authorization code") ||
        serverMsg.toLowerCase().includes("unauthorized") ||
        error.response?.status === 403
      ) {
        alert(`🔒 Authorization Failed:\n\n${serverMsg || "Invalid official authorization code for this role."}`);
        return;
      }

      // 3. General Fallback
      alert(`Registration Unsuccessful:\n\n${serverMsg || "Unable to connect to server. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Ambient background glow orbs */}
      <div className="auth-glow-orb-1" />
      <div className="auth-glow-orb-2" />

      <div className="auth-card-wrapper wide">
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

          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-desc">Fill in the details to register your portal account</p>

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {/* Full Name Input */}
            <div className="auth-field-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <FaUser className="auth-input-icon" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="auth-field-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <FaEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  placeholder="e.g. student@college.edu"
                />
              </div>
            </div>

            {/* Mobile Number Input */}
            <div className="auth-field-group">
              <label className="auth-label">Mobile Number (10 Digits)</label>
              <div className="auth-input-wrapper">
                <FaPhone className="auth-input-icon" />
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  className="auth-input"
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <FaLock className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input"
                  style={{ paddingRight: '44px' }}
                  placeholder="Create a strong password"
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

            {/* Role Select Dropdown */}
            <div className="auth-field-group">
              <label className="auth-label">Select Role</label>
              <div className="auth-input-wrapper">
                <FaUserShield className="auth-input-icon" />
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  className="auth-input auth-select"
                >
                  <option value="" disabled>Choose Your Role</option>
                  <option value="4">🎓 Student (Public Registration)</option>
                  <option value="1">👔 HOD (Requires Auth Code)</option>
                  <option value="2">👑 Principal (Requires Auth Code)</option>
                  <option value="3">👨‍🏫 Professor (Requires Auth Code)</option>
                  <option value="5">📚 Librarian (Requires Auth Code)</option>
                  <option value="6">💼 Placement Officer (Requires Auth Code)</option>
                </select>
              </div>
            </div>

            {/* 🔒 Role Authorization Code (Displayed strictly for Non-Student elevated roles) */}
            {formData.role_id && formData.role_id !== "4" && (
              <div className="auth-field-group" style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "14px",
                padding: "16px",
                marginTop: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <FaShieldAlt color="#ef4444" size={16} />
                  <label className="auth-label" style={{ color: "#f87171", margin: 0, fontWeight: "700" }}>
                    Official Authorization Code *
                  </label>
                </div>
                <div className="auth-input-wrapper">
                  <FaKey className="auth-input-icon" style={{ color: "#ef4444" }} />
                  <input
                    type="password"
                    name="authCode"
                    value={formData.authCode}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    placeholder="Enter official college security key"
                    style={{ borderColor: "rgba(239, 68, 68, 0.4)" }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-btn-submit"
              disabled={loading}
              style={{ marginTop: '14px' }}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Registering...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="auth-footer">
              <span>Already have an account?</span>
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

export default Register;