import React from 'react';
import { useNavigate } from "react-router-dom";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f4", margin: 0 }}>
      {/* Sidebar - Updated Design */}
      <div style={{ width: "260px", background: "#1e1e2d", color: "white", padding: "25px", display: "flex", flexDirection: "column" }}>

        <h2 style={{ fontSize: "22px", marginBottom: "30px", color: "#ffffff" }}>CMS Portal</h2>

        {/* Profile Section */}
        {user && (
          <div style={{
            background: "#2b2b40",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "30px",
            borderLeft: "4px solid #00d4ff"
          }}>
            <p style={{ margin: "0", fontSize: "11px", color: "#a2a2b9", textTransform: "uppercase" }}>Welcome</p>
            <p style={{ margin: "4px 0 0 0", fontWeight: "bold", fontSize: "14px", wordBreak: "break-all" }}>{user.emailId}</p>
          </div>
        )}

        {/* Home Link */}
        <div
          style={{ cursor: "pointer", fontSize: "16px", marginBottom: "auto", color: "#e0e0e0", padding: "10px 0", borderBottom: "1px solid #333" }}
          onClick={() => navigate("/dashboard")}
        >
          Home Dashboard
        </div>

        {/* Logout Button */}
        <button
          style={{
            background: "#ff4d4d",
            border: "none",
            padding: "12px",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "20px"
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content Grid */}
      <div style={{ flex: 1, padding: "40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px"
        }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={() => navigate(item.path)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;