import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser, FaPhone, FaEnvelope, FaArrowLeft,
  FaCheckCircle, FaCamera, FaSave, FaShieldAlt
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

function Profile() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("User");
  const [profilePic, setProfilePic] = useState("");
  const [previewPic, setPreviewPic] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const roleNames = { 1: "HOD", 2: "Principal", 3: "Professor", 4: "Student" };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userEmail = user?.emailId || localStorage.getItem("userEmail") || "";
    const roleId = Number(user?.role_id || user?.roleId || 4);

    setUserId(user?.user_id || null);
    setEmail(userEmail);
    setFullName(user?.full_name || user?.fullName || "");
    setPhone(user?.mobile_no || user?.phone || "");
    setRoleName(roleNames[roleId] || "User");

    const savedPic = user?.profile_pic || localStorage.getItem("userProfilePic") || "";
    setProfilePic(savedPic);
    setPreviewPic(savedPic);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Image size should be less than 2MB");
        return;
      }
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPic(reader.result);
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 10-Digit Mobile Restriction
  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numericValue);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSaveMessage("");

    if (phone && phone.length !== 10) {
      setErrorMessage("Mobile number must be exactly 10 digits!");
      return;
    }

    const existingUser = JSON.parse(localStorage.getItem("user")) || {};
    const currentUserId = userId || existingUser?.user_id;

    if (!currentUserId) {
      setErrorMessage("User ID not found. Please login again.");
      return;
    }

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");

      if (!token) {
        setErrorMessage("Authentication token not found. Please login again.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      if (profilePic) {
        await axios.put(
          `http://localhost:8080/api/users/${currentUserId}/update-profile-pic`,
          { profilePic: profilePic },
          { headers }
        );
      }

      const updatedUser = {
        ...existingUser,
        user_id: currentUserId,
        full_name: fullName,
        fullName: fullName,
        mobile_no: phone,
        phone: phone,
        emailId: email,
        profile_pic: profilePic
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (profilePic) {
        localStorage.setItem("userProfilePic", profilePic);
      }

      window.dispatchEvent(new Event("profileUpdated"));
      setSaveMessage("Profile updated successfully in Database!");
      setTimeout(() => setSaveMessage(""), 3500);

    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage("Failed to update profile.");
    }
  };

  const themeStyles = {
    bg: darkMode ? "linear-gradient(135deg, #090d16 0%, #111827 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.bg,
      padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center",
      boxSizing: "border-box", fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: "100%", maxWidth: "560px", background: themeStyles.cardBg,
        borderRadius: "28px", padding: "40px", border: `1px solid ${themeStyles.cardBorder}`,
        boxShadow: "0 25px 60px rgba(0,0,0,0.15)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <button onClick={() => navigate('/dashboard')} style={{
            display: "flex", alignItems: "center", gap: "8px", background: "none",
            border: "none", color: "#6366f1", fontWeight: "700", cursor: "pointer", fontSize: "14px"
          }}>
            <FaArrowLeft /> Dashboard
          </button>
          <span style={{
            display: "flex", alignItems: "center", gap: "6px", background: "rgba(99, 102, 241, 0.12)",
            color: "#6366f1", padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "700"
          }}>
            <FaShieldAlt /> {roleName}
          </span>
        </div>

        {/* Profile Avatar with Camera Upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "30px" }}>
          <div style={{ position: "relative" }}>
            <img
              src={previewPic || DEFAULT_AVATAR}
              alt="Avatar"
              style={{
                width: "110px", height: "110px", borderRadius: "50%",
                objectFit: "cover", border: "4px solid #6366f1",
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)"
              }}
            />
            <label style={{
              position: "absolute", bottom: "0", right: "0", background: "#6366f1",
              color: "#ffffff", padding: "8px", borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
            }}>
              <FaCamera size={14} />
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
          </div>
          <h2 style={{ margin: "14px 0 2px 0", color: themeStyles.textPrimary, fontSize: "22px", fontWeight: "800" }}>{fullName || "User Profile"}</h2>
          <p style={{ margin: 0, color: themeStyles.textSecondary, fontSize: "13px" }}>{email}</p>
        </div>

        {saveMessage && <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#10b981", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>{saveMessage}</div>}
        {errorMessage && <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "12px", marginBottom: "20px", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>{errorMessage}</div>}

        <form onSubmit={handleSaveInfo} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>FULL NAME</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>EMAIL (READ ONLY)</label>
            <input type="email" value={email} readOnly style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textSecondary, outline: "none", opacity: 0.8 }} />
          </div>

          {/* 10-Digit Mobile */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>MOBILE NUMBER (10 DIGITS)</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
              style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
            />
          </div>

          <button type="submit" style={{
            padding: "14px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            color: "white", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer",
            marginTop: "12px", boxShadow: "0 10px 25px rgba(99, 102, 241, 0.35)", fontSize: "15px"
          }}>
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;