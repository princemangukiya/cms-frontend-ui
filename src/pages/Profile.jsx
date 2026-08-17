import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaCheckCircle,
  FaUserEdit,
  FaRegSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Profile() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Profile States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Initial Data Loading
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userEmail = user?.emailId || localStorage.getItem("userEmail") || "v12@gmail.com";

    setEmail(userEmail);
    setFullName(user?.fullName || "");
    setPhone(user?.phone || "");
  }, []);

  // Save Personal Info
  const handleSaveInfo = (e) => {
    e.preventDefault();
    const existingUser = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = {
      ...existingUser,
      fullName: fullName,
      phone: phone,
      emailId: email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("profileUpdated"));

    setSaveMessage("Profile updated successfully!");
    setTimeout(() => setSaveMessage(""), 3500);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: darkMode
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: darkMode ? "#f8fafc" : "#0f172a",
      padding: "35px 50px",
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      transition: "all 0.3s ease",
      boxSizing: "border-box"
    }}>

      {/* Top Header Section */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "35px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: darkMode ? "#1e293b" : "#ffffff",
              color: darkMode ? "#38bdf8" : "#2563eb",
              border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
              padding: "10px 20px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateX(-3px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateX(0)"}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
              Account Settings
            </h1>
            <p style={{ margin: "3px 0 0 0", fontSize: "13px", color: darkMode ? "#94a3b8" : "#64748b" }}>
              Manage your profile information and account details
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveMessage && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          padding: "14px 22px",
          borderRadius: "14px",
          marginBottom: "25px",
          fontWeight: "600",
          fontSize: "14px",
          boxShadow: "0 8px 20px rgba(16, 185, 129, 0.25)"
        }}>
          <FaCheckCircle size={18} />
          {saveMessage}
        </div>
      )}

      {/* Profile Form Card */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        padding: "35px",
        borderRadius: "24px",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: darkMode ? "0 20px 30px rgba(0, 0, 0, 0.3)" : "0 20px 30px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "28px",
          paddingBottom: "15px",
          borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            padding: "10px",
            borderRadius: "12px",
            display: "flex"
          }}>
            <FaUserEdit size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              Personal Information
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: darkMode ? "#94a3b8" : "#64748b" }}>
              Update your personal info and contact details
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Full Name Input */}
            <div>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                color: darkMode ? "#cbd5e1" : "#475569"
              }}>
                <FaUser size={12} color="#3b82f6" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: darkMode ? "#f8fafc" : "#0f172a",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Phone Number Input */}
            <div>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                color: darkMode ? "#cbd5e1" : "#475569"
              }}>
                <FaPhone size={12} color="#3b82f6" /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: darkMode ? "1px solid #334155" : "1px solid #cbd5e1",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: darkMode ? "#f8fafc" : "#0f172a",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Email Field (Disabled) */}
          <div>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
              color: darkMode ? "#cbd5e1" : "#475569"
            }}>
              <FaEnvelope size={12} color="#64748b" /> Email Address <span style={{ fontSize: "11px", color: "#94a3b8" }}>(Read Only)</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
                background: darkMode ? "#0f172a" : "#f1f5f9",
                color: darkMode ? "#64748b" : "#94a3b8",
                fontSize: "14px",
                cursor: "not-allowed",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
            <button
              type="submit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                padding: "13px 28px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(37, 99, 235, 0.3)"
              }}
            >
              <FaRegSave size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;