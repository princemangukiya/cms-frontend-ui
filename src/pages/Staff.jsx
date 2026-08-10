import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie, FaBriefcase, FaPhone, FaVenusMars,
  FaMapMarkerAlt, FaCalendarAlt, FaEnvelope,
  FaMoneyBillWave, FaIdBadge, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Staff() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [staff, setStaff] = useState({
    staffname: "", designation: "", mobileno: "", gender: "",
    address: "", dob: "", email: "", joiningdate: "",
    salary: "", user_id: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({
      ...prev,
      [name]: (name === "salary" || name === "user_id")
              ? (value === "" ? "" : parseInt(value))
              : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/staff/add", staff);
      alert("Staff Saved Successfully!");
      setStaff({
        staffname: "", designation: "", mobileno: "", gender: "",
        address: "", dob: "", email: "", joiningdate: "",
        salary: "", user_id: ""
      });
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Error! Check terminal for Foreign Key or Null constraint issues.");
    }
  };

  const themeStyles = {
    pageBg: darkMode
      ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
      : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.5)" : "0 15px 35px rgba(0, 0, 0, 0.08)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    iconColor: "#d97706"
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, options = null) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute",
            left: "14px",
            color: themeStyles.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>
          {options ? (
            <select
              name={name}
              value={staff[name]}
              onChange={handleChange}
              required={required}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                borderRadius: "12px",
                border: `2px solid ${themeStyles.inputBorder}`,
                background: themeStyles.inputBg,
                color: themeStyles.textPrimary,
                fontSize: "14px",
                fontWeight: "500",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#f59e0b";
                e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }}
            >
              <option value="" style={{ color: "#000" }}>Select Gender</option>
              {options.map((opt) => (
                <option key={opt} value={opt} style={{ color: "#000" }}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={staff[name]}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              autoComplete="off"
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                borderRadius: "12px",
                border: `2px solid ${themeStyles.inputBorder}`,
                background: themeStyles.inputBg,
                color: themeStyles.textPrimary,
                fontSize: "14px",
                fontWeight: "500",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#f59e0b";
                e.target.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: themeStyles.pageBg,
      padding: "40px 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "850px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Modern Vibrant Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Staff Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Add and manage staff members record
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}>
            {renderInputField("Staff Name", "staffname", "Enter Staff Name", FaUserTie, "text", true)}
            {renderInputField("Designation", "designation", "e.g. Senior Professor", FaBriefcase, "text")}
            {renderInputField("Mobile Number", "mobileno", "Enter Mobile No", FaPhone, "text")}
            {renderInputField("Gender", "gender", "", FaVenusMars, "text", false, ["Male", "Female", "Other"])}
            {renderInputField("Address", "address", "Enter Address", FaMapMarkerAlt, "text")}
            {renderInputField("Date of Birth", "dob", "", FaCalendarAlt, "date")}
            {renderInputField("Email Address", "email", "Enter Email Address", FaEnvelope, "email")}
            {renderInputField("Joining Date", "joiningdate", "", FaCalendarAlt, "date")}
            {renderInputField("Salary", "salary", "Enter Salary Amount", FaMoneyBillWave, "number")}
            {renderInputField("User ID", "user_id", "Enter User ID", FaIdBadge, "number")}
          </div>

          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
            justifyContent: "flex-end",
            alignItems: "center"
          }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: "12px 28px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#475569",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
            >
              <FaArrowLeft size={14} /> Back
            </button>

            <button
              type="submit"
              style={{
                padding: "12px 36px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(245, 158, 11, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(245, 158, 11, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Staff;