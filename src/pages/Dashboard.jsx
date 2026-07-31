import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaBookOpen, FaChartBar, FaClipboardCheck, FaTasks, FaRegCalendarAlt, FaUniversity, FaDollarSign, FaSuitcase, FaBuilding, FaMoneyBillWave, FaComments, FaTrophy } from 'react-icons/fa';
import TopBar from "../components/TopBar";
import { useTheme } from "../context/ThemeContext";

const moduleConfig = {
  Student: { icon: FaUserGraduate, color: "#7e22ce", bg: "#f3e8ff" },
  Staff: { icon: FaChalkboardTeacher, color: "#d97706", bg: "#fef3c7" },
  Course: { icon: FaBook, color: "#2563eb", bg: "#dbeafe" },
  Subject: { icon: FaBookOpen, color: "#059669", bg: "#d1fae5" },
  Result: { icon: FaChartBar, color: "#db2777", bg: "#fce7f3" },
  Attendance: { icon: FaClipboardCheck, color: "#7e22ce", bg: "#f3e8ff" },
  "Book Issue": { icon: FaTasks, color: "#d97706", bg: "#fef3c7" },
  "Class Mgmt": { icon: FaUniversity, color: "#2563eb", bg: "#dbeafe" },
  Exam: { icon: FaRegCalendarAlt, color: "#059669", bg: "#d1fae5" },
  Feedback: { icon: FaComments, color: "#db2777", bg: "#fce7f3" },
  Fees: { icon: FaDollarSign, color: "#7e22ce", bg: "#f3e8ff" },
  Holiday: { icon: FaRegCalendarAlt, color: "#d97706", bg: "#fef3c7" },
  Library: { icon: FaBookOpen, color: "#2563eb", bg: "#dbeafe" },
  Payment: { icon: FaMoneyBillWave, color: "#059669", bg: "#d1fae5" },
  "Company Placement": { icon: FaBuilding, color: "#db2777", bg: "#fce7f3" },
  "Placement Student": { icon: FaSuitcase, color: "#7e22ce", bg: "#f3e8ff" },
};

function Dashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme(); // Theme Hook Consume Kiya
  const [searchTerm, setSearchTerm] = useState(''); // Live Search State

  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { name: "Student", path: "/student" },
    { name: "Staff", path: "/staff" },
    { name: "Course", path: "/course" },
    { name: "Subject", path: "/subject" },
    { name: "Result", path: "/result" },
    { name: "Attendance", path: "/attendance" },
    { name: "Book Issue", path: "/book-issue" },
    { name: "Class Mgmt", path: "/class-mgmt" },
    { name: "Exam", path: "/exam" },
    { name: "Feedback", path: "/feedback" },
    { name: "Fees", path: "/fees" },
    { name: "Holiday", path: "/holiday" },
    { name: "Library", path: "/library" },
    { name: "Payment", path: "/payment" },
    { name: "Company Placement", path: "/placement" },
    { name: "Placement Student", path: "/placement-student" },
  ];

  // Search Filter Logic
  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: darkMode ? "#0f172a" : "#f1f5f9", // Full Background Dark/Light Switch
      color: darkMode ? "#f8fafc" : "#1e293b",
      margin: 0,
      fontFamily: "'Inter', sans-serif",
      transition: "all 0.3s ease"
    }}>
      {/* Sidebar */}
      <div style={{
        width: "260px",
        background: darkMode ? "#020617" : "#0f172a",
        color: "white",
        padding: "25px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 15px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ fontSize: "22px", marginBottom: "35px", color: "#ffffff", fontWeight: "700", letterSpacing: "0.5px" }}>CMS Portal</h2>

        {user && (
          <div style={{
            background: darkMode ? "#0f172a" : "#1e293b",
            padding: "15px",
            borderRadius: "12px",
            marginBottom: "30px",
            borderLeft: "4px solid #3b82f6"
          }}>
            <p style={{ margin: "0", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>WELCOME</p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "600", fontSize: "13px", wordBreak: "break-all", color: "#f8fafc" }}>{user.emailId}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{ cursor: "pointer", fontSize: "14px", color: "#ffffff", padding: "12px 16px", background: "#3b82f6", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px" }}
            onClick={() => navigate("/dashboard")}
          >
            <FaChartBar size={16} /> Home Dashboard
          </div>

          <div
            style={{ cursor: "pointer", fontSize: "14px", color: "#cbd5e1", padding: "12px 16px", background: darkMode ? "#0f172a" : "#1e293b", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px", transition: "0.2s" }}
            onClick={() => navigate("/sports")}
          >
            <FaTrophy size={16} color="#eab308" /> Sports
          </div>

          <div
            style={{ cursor: "pointer", fontSize: "14px", color: "#cbd5e1", padding: "12px 16px", background: darkMode ? "#0f172a" : "#1e293b", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px", transition: "0.2s" }}
            onClick={() => navigate("/function")}
          >
            <FaRegCalendarAlt size={16} color="#ec4899" /> Function
          </div>
        </div>

        <button
          style={{
            background: "#ef4444",
            border: "none",
            padding: "12px",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            marginTop: "auto"
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto" }}>

        {/* TopBar with Search Props */}
        <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "30px", color: darkMode ? "#f8fafc" : "#1e293b" }}>
          Dashboard Overview
        </div>

        {/* Dynamic Card Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px"
        }}>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => {
              const config = moduleConfig[item.name] || moduleConfig.Student;
              const IconComponent = config.icon;

              return (
                <div
                  key={item.name}
                  style={{
                    background: darkMode ? "#1e293b" : "#ffffff", // Dynamic Card Dark Mode
                    padding: "24px",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.borderColor = config.color;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = darkMode ? "#334155" : "#e2e8f0";
                  }}
                >
                  <div style={{
                    background: darkMode ? "#334155" : config.bg,
                    padding: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px"
                  }}>
                    <IconComponent size={28} color={config.color} />
                  </div>

                  <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: darkMode ? "#f8fafc" : "#1e293b" }}>
                    {item.name}
                  </h3>

                  <button
                    onClick={() => navigate(item.path)}
                    style={{
                      background: config.color,
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    Add Detail
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ colSpan: "all", textAlign: "center", padding: "40px", color: darkMode ? "#94a3b8" : "#64748b" }}>
              No matching modules found for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;