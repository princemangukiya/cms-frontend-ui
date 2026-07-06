import React from 'react';
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // 👤 user (optional display)
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

  // 🚪 LOGOUT FUNCTION (MAIN ADDITION)
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // optional
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f4" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#333",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column"
      }}>

        <h2>CMS Portal</h2>

        {/* 👤 USER INFO */}
        {user && (
          <p style={{ fontSize: "14px", marginBottom: "10px", color: "#ccc" }}>
            Welcome, {user.emailId}
          </p>
        )}

        {/* HOME */}
        <p
          style={{ cursor: "pointer", marginBottom: "20px" }}
          onClick={() => navigate("/dashboard")}
        >
          Home Dashboard
        </p>

        {/* 🚪 LOGOUT BUTTON (NEW) */}
        <div
          style={{
            marginTop: "auto",
            padding: "10px",
            background: "#ff4d4d",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "center",
            fontWeight: "bold"
          }}
          onClick={handleLogout}
        >
          Logout
        </div>

      </div>

      {/* MAIN GRID */}
      <div style={{ flex: 1, padding: "40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              style={cardStyle}
              onClick={() => navigate(item.path)}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <h3>{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
  cursor: "pointer",
  transition: "0.3s"
};

export default Dashboard;