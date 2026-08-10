import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Student() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [student, setStudent] = useState({
    student_name: "", mobile_no: "", gender: "", address: "",
    dob: "", email: "", admission_date: "", status: "",
    roll_no: "", user_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/student", student);
      alert("Student Saved Successfully");
      setStudent({
        student_name: "", mobile_no: "", gender: "", address: "",
        dob: "", email: "", admission_date: "", status: "",
        roll_no: "", user_id: "",
      });
    } catch (error) {
      alert("Error saving student.");
    }
  };

  // Ultra-Modern Theme Styling Map
  const themeStyles = {
    pageBg: darkMode
      ? "radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 40%, #020617 100%)"
      : "radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 40%, #f1f5f9 100%)",
    cardBg: darkMode ? "rgba(30, 41, 59, 0.85)" : "rgba(255, 255, 255, 0.9)",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
    cardShadow: darkMode ? "0 25px 50px -12px rgba(0, 0, 0, 0.6)" : "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
    inputBorder: darkMode ? "rgba(255, 255, 255, 0.12)" : "#cbd5e1",
    labelColor: darkMode ? "#cbd5e1" : "#475569"
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
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.4s ease"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "850px",
        background: themeStyles.cardBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        transition: "all 0.3s ease"
      }}>
        {/* Header Block with Modern Gradient */}
        <div style={{
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          padding: "36px 30px",
          color: "#ffffff",
          textAlign: "center",
          position: "relative"
        }}>
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Student Management
          </h2>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Manage and register new student details
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ padding: "40px 36px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}>
            {/* Student Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Student Name *
              </label>
              <input
                name="student_name"
                value={student.student_name}
                onChange={handleChange}
                placeholder="Enter Student Name"
                required
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease"
                }}
              />
            </div>

            {/* Mobile No */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Mobile Number
              </label>
              <input
                name="mobile_no"
                value={student.mobile_no}
                onChange={handleChange}
                placeholder="Enter Mobile No"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Gender */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Gender
              </label>
              <select
                name="gender"
                value={student.gender}
                onChange={handleChange}
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              >
                <option value="" style={{ color: "#000" }}>Select Gender</option>
                <option value="Male" style={{ color: "#000" }}>Male</option>
                <option value="Female" style={{ color: "#000" }}>Female</option>
                <option value="Other" style={{ color: "#000" }}>Other</option>
              </select>
            </div>

            {/* Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Address
              </label>
              <input
                name="address"
                value={student.address}
                onChange={handleChange}
                placeholder="Enter Address"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Date of Birth Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={student.dob}
                onChange={handleChange}
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={student.email}
                onChange={handleChange}
                placeholder="Enter Email Address"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Admission Date Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Admission Date
              </label>
              <input
                type="date"
                name="admission_date"
                value={student.admission_date}
                onChange={handleChange}
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Status
              </label>
              <input
                name="status"
                value={student.status}
                onChange={handleChange}
                placeholder="e.g. Active, Inactive"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Roll No */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Roll Number
              </label>
              <input
                name="roll_no"
                value={student.roll_no}
                onChange={handleChange}
                placeholder="Enter Roll No"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* User ID */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                User ID
              </label>
              <input
                type="number"
                name="user_id"
                value={student.user_id}
                onChange={handleChange}
                placeholder="Enter User ID"
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "36px",
            justifyContent: "flex-end",
            alignItems: "center"
          }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: "14px 32px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
                borderRadius: "16px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ef4444";
                e.target.style.color = "#ffffff";
                e.target.style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.35)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(239, 68, 68, 0.1)";
                e.target.style.color = "#ef4444";
                e.target.style.boxShadow = "none";
              }}
            >
              Back
            </button>

            <button
              type="submit"
              style={{
                padding: "14px 40px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.35)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 14px 30px rgba(99, 102, 241, 0.45)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 10px 25px rgba(99, 102, 241, 0.35)";
              }}
            >
              Save Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Student;