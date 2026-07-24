import React from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaBookOpen, FaChartBar, FaClipboardCheck, FaTasks, FaRegCalendarAlt, FaUniversity, FaDollarSign, FaSuitcase, FaBuilding, FaMoneyBillWave, FaComments, FaTrophy } from 'react-icons/fa';

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", margin: 0, fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar with Sports and Function added */}
      <div style={{ width: "260px", background: "#0f172a", color: "white", padding: "25px", display: "flex", flexDirection: "column", boxShadow: "4px 0 15px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "35px", color: "#ffffff", fontWeight: "700", letterSpacing: "0.5px" }}>CMS Portal</h2>

        {user && (
          <div style={{
            background: "#1e293b",
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

          {/* Added Sports Menu */}
          <div
            style={{ cursor: "pointer", fontSize: "14px", color: "#cbd5e1", padding: "12px 16px", background: "#1e293b", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px", transition: "0.2s" }}
            onClick={() => navigate("/sports")}
            onMouseOver={(e) => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#cbd5e1"; }}
          >
            <FaTrophy size={16} color="#eab308" /> Sports
          </div>

          {/* Added Function Menu */}
          <div
            style={{ cursor: "pointer", fontSize: "14px", color: "#cbd5e1", padding: "12px 16px", background: "#1e293b", borderRadius: "8px", fontWeight: "500", display: "flex", alignItems: "center", gap: "12px", transition: "0.2s" }}
            onClick={() => navigate("/function")}
            onMouseOver={(e) => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#cbd5e1"; }}
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
            marginTop: "auto",
            transition: "background 0.2s"
          }}
          onClick={handleLogout}
          onMouseOver={(e) => e.currentTarget.style.background = "#dc2626"}
          onMouseOut={(e) => e.currentTarget.style.background = "#ef4444"}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <div style={{ fontSize: "26px", fontWeight: "700", marginBottom: "30px", color: "#1e293b" }}>
          Dashboard Overview
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px"
        }}>
          {menuItems.map((item) => {
            const config = moduleConfig[item.name] || moduleConfig.Student;
            const IconComponent = config.icon;

            return (
              <div
                key={item.name}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  border: "1px solid #e2e8f0",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 20px -3px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.borderColor = config.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <div style={{
                  background: config.bg,
                  padding: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px"
                }}>
                  <IconComponent size={28} color={config.color} />
                </div>

                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>{item.name}</h3>

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
                    width: "100%",
                    transition: "opacity 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Add Detail
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;