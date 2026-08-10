import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap, FaLayerGroup, FaMoneyBillWave, FaArrowLeft, FaSave } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Course() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [course, setCourse] = useState({
    course_name: "",
    semester: "",
    course_fee: "",
  });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/courses", {
        ...course,
        course_fee: parseFloat(course.course_fee)
      });

      alert("Course Saved Successfully");
      setCourse({ course_name: "", semester: "", course_fee: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving course! Check backend console.");
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
    iconColor: "#3b82f6"
  };

  const courseOptions = [
    { value: "B.Tech", label: "B.Tech (Bachelor of Technology)" },
    { value: "M.Tech", label: "M.Tech (Master of Technology)" },
    { value: "BCA", label: "BCA (Bachelor of Computer Applications)" },
    { value: "MCA", label: "MCA (Master of Computer Applications)" },
    { value: "BSc", label: "BSc (Bachelor of Science)" },
    { value: "MSc", label: "MSc (Master of Science)" },
    { value: "BBA", label: "BBA (Bachelor of Business Administration)" },
    { value: "MBA", label: "MBA (Master of Business Administration)" },
    { value: "B.Com", label: "B.Com (Bachelor of Commerce)" },
    { value: "M.Com", label: "M.Com (Master of Commerce)" },
    { value: "BA", label: "BA (Bachelor of Arts)" },
    { value: "MA", label: "MA (Master of Arts)" },
    { value: "B.Pharm", label: "B.Pharm (Bachelor of Pharmacy)" },
    { value: "D.Pharm", label: "D.Pharm (Diploma in Pharmacy)" },
    { value: "LLB", label: "LLB (Bachelor of Laws)" },
    { value: "Diploma in Engineering", label: "Diploma in Engineering" }
  ];

  const semesterOptions = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5",
    "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10"
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
        maxWidth: "600px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Header with Cool Gradient */}
        <div style={{
          background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Course Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Add New Course Details
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Course Name Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Course Name <span style={{ color: "#ef4444" }}>*</span>
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
                  <FaGraduationCap size={16} />
                </div>
                <select
                  name="course_name"
                  value={course.course_name}
                  onChange={handleChange}
                  required
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
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
                    e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = themeStyles.inputBorder;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = themeStyles.inputBg;
                  }}
                >
                  <option value="" style={{ color: "#000" }}>Select Course Name</option>
                  {courseOptions.map((item) => (
                    <option key={item.value} value={item.value} style={{ color: "#000" }}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Semester <span style={{ color: "#ef4444" }}>*</span>
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
                  <FaLayerGroup size={16} />
                </div>
                <select
                  name="semester"
                  value={course.semester}
                  onChange={handleChange}
                  required
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
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
                    e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = themeStyles.inputBorder;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = themeStyles.inputBg;
                  }}
                >
                  <option value="" style={{ color: "#000" }}>Select Semester</option>
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem} style={{ color: "#000" }}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Fee Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Course Fee <span style={{ color: "#ef4444" }}>*</span>
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
                  <FaMoneyBillWave size={16} />
                </div>
                <input
                  type="number"
                  name="course_fee"
                  placeholder="Enter Course Fee Amount"
                  value={course.course_fee}
                  onChange={handleChange}
                  required
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
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.2)";
                    e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = themeStyles.inputBorder;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = themeStyles.inputBg;
                  }}
                />
              </div>
            </div>

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
                background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(37, 99, 235, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Course;