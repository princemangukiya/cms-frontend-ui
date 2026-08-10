import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserTag, FaUserCheck, FaStar,
  FaCommentAlt, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Feedback() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [feedback, setFeedback] = useState({
    feedbackFrom: "", feedbackTo: "", rating: "", feedbackMessage: "",
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/feedback", feedback);
      alert("Feedback Saved Successfully!");
      setFeedback({ feedbackFrom: "", feedbackTo: "", rating: "", feedbackMessage: "" });
    } catch (error) {
      alert("Unable to Save Feedback");
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
    iconColor: "#ec4899"
  };

  const renderInputField = (label, name, IconComponent, required = false, options = null, isTextArea = false, isFullWidth = false) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: isFullWidth ? "span 2" : "span 1" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: isTextArea ? "flex-start" : "center" }}>
          <div style={{
            position: "absolute",
            left: "14px",
            top: isTextArea ? "14px" : "auto",
            color: themeStyles.iconColor,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>

          {options ? (
            <select
              name={name}
              value={feedback[name]}
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
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ec4899";
                e.target.style.boxShadow = "0 0 0 3px rgba(236, 72, 153, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }}
            >
              {options.map((opt, idx) => (
                <option key={idx} value={opt.value} style={{ color: "#000" }}>{opt.label}</option>
              ))}
            </select>
          ) : isTextArea ? (
            <textarea
              name={name}
              value={feedback[name]}
              onChange={handleChange}
              placeholder="Enter your feedback here..."
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
                height: "100px",
                resize: "none",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                fontFamily: "inherit"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ec4899";
                e.target.style.boxShadow = "0 0 0 3px rgba(236, 72, 153, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const roleOptions = [
    { value: "", label: "Select Role" },
    { value: "1", label: "HOD" },
    { value: "2", label: "Principal" },
    { value: "3", label: "Professor" },
    { value: "4", label: "Student" }
  ];

  const ratingOptions = [
    { value: "", label: "Select Rating" },
    { value: "1", label: "⭐ 1" },
    { value: "2", label: "⭐⭐ 2" },
    { value: "3", label: "⭐⭐⭐ 3" },
    { value: "4", label: "⭐⭐⭐⭐ 4" },
    { value: "5", label: "⭐⭐⭐⭐⭐ 5" }
  ];

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
        maxWidth: "650px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Rose/Pink Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Feedback Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Submit Your Feedback
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {renderInputField("Feedback From", "feedbackFrom", FaUserTag, true, roleOptions)}
            {renderInputField("Feedback To", "feedbackTo", FaUserCheck, true, roleOptions)}
            {renderInputField("Rating", "rating", FaStar, true, ratingOptions, false, true)}
            {renderInputField("Feedback Message", "feedbackMessage", FaCommentAlt, true, null, true, true)}
          </div>

          {/* Action Buttons */}
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
                background: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(236, 72, 153, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(236, 72, 153, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(236, 72, 153, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Feedback;