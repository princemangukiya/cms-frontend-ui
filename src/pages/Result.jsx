import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaBook, FaPoll, FaStar,
  FaCheckCircle, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Result() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [result, setResult] = useState({
    studentId: "", subjectId: "", totalMarks: "", grade: "", status: "",
  });

  const handleChange = (e) => {
    setResult((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      totalMarks: parseInt(result.totalMarks),
      grade: result.grade,
      status: result.status,
      student: { student_id: parseInt(result.studentId) },
      subject: { subject_id: parseInt(result.subjectId) }
    };

    try {
      await axios.post("http://localhost:8080/api/results/save", payload, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Result Saved Successfully!");
      setResult({ studentId: "", subjectId: "", totalMarks: "", grade: "", status: "" });
    } catch (error) {
      alert("Failed to save. Check console for error details!");
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
    iconColor: "#10b981"
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
            pointerEvents: "none",
            zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>
          {options ? (
            <select
              name={name}
              value={result[name]}
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
                e.target.style.borderColor = "#10b981";
                e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }}
            >
              <option value="" style={{ color: "#000" }}>Select {label}</option>
              {options.map((opt) => (
                <option key={opt} value={opt} style={{ color: "#000" }}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={result[name]}
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
                e.target.style.borderColor = "#10b981";
                e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
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
        maxWidth: "600px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Emerald Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Result Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Manage Student Results
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {renderInputField("Student ID", "studentId", "Enter Student ID", FaUser, "number", true)}
            {renderInputField("Subject ID", "subjectId", "Enter Subject ID", FaBook, "number", true)}
            {renderInputField("Total Marks", "totalMarks", "Enter Total Marks", FaPoll, "number", true)}
            {renderInputField("Grade", "grade", "e.g. A, B, C, A+", FaStar, "text", true)}
            {renderInputField("Status", "status", "", FaCheckCircle, "text", true, ["Pass", "Fail"])}
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
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(16, 185, 129, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Result;