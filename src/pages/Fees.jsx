import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaGraduationCap, FaGift,
  FaPercent, FaMoneyBillWave, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Fees() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [fees, setFees] = useState({
    courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let updatedFees = { ...fees, [name]: value };

    if (["courseId", "scholarship", "discountPercentage"].includes(name) && updatedFees.courseId !== "") {
        try {
            const response = await axios.get(`http://localhost:8080/api/courses/${updatedFees.courseId}`);
            const courseFee = response.data.course_fee;
            let scholarship = Number(updatedFees.scholarship) || 0;
            let discount = Number(updatedFees.discountPercentage) || 0;
            let total = courseFee - scholarship;
            total = total - ((total * discount) / 100);
            updatedFees.totalFees = total.toFixed(2);
        } catch (error) {
            console.log(error);
        }
    }
    setFees(updatedFees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/fees", fees);
      alert("Fees Saved Successfully");
      setFees({ courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "" });
    } catch (error) {
      alert("Failed To Save Fees");
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
    iconColor: "#6366f1"
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, readOnly = false, isFullWidth = false) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: isFullWidth ? "span 2" : "span 1" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute",
            left: "14px",
            color: readOnly ? "#10b981" : themeStyles.iconColor,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>
          <input
            type={type}
            name={name}
            value={fees[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            step="0.01"
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              borderRadius: "12px",
              border: `2px solid ${readOnly ? (darkMode ? "#059669" : "#10b981") : themeStyles.inputBorder}`,
              background: readOnly ? (darkMode ? "#064e3b" : "#ecfdf5") : themeStyles.inputBg,
              color: readOnly ? (darkMode ? "#a7f3d0" : "#065f46") : themeStyles.textPrimary,
              fontSize: readOnly ? "16px" : "14px",
              fontWeight: readOnly ? "700" : "500",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.2s ease"
            }}
            onFocus={(e) => {
              if (!readOnly) {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.2)";
                e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
              }
            }}
            onBlur={(e) => {
              if (!readOnly) {
                e.target.style.borderColor = themeStyles.inputBorder;
                e.target.style.boxShadow = "none";
                e.target.style.background = themeStyles.inputBg;
              }
            }}
          />
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
        maxWidth: "650px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Indigo Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Fees Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Manage Student Fee Structure
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {renderInputField("Student ID", "studentId", "Enter Student ID", FaUser, "number", true)}
            {renderInputField("Course ID", "courseId", "Enter Course ID", FaGraduationCap, "number", true)}
            {renderInputField("Scholarship Amount", "scholarship", "Scholarship Amount", FaGift, "number")}
            {renderInputField("Discount (%)", "discountPercentage", "Discount Percentage", FaPercent, "number")}
            {renderInputField("Total Fees", "totalFees", "Calculated Total Fees", FaMoneyBillWave, "number", true, true, true)}
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
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(99, 102, 241, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Fees
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Fees;