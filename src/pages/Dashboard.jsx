
import React from 'react';
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

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
        <p style={{ cursor: "pointer", marginBottom: "auto" }} onClick={() => navigate("/dashboard")}>
          Home Dashboard
        </p>

        {/* Back to Login Section */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid #555",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#ffcccc",
            transition: "0.3s"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "#fff"}
          onMouseOut={(e) => e.currentTarget.style.color = "#ffcccc"}
          onClick={() => navigate("/")}
        >
          <span>←</span> <strong>Back to Login</strong>
        </div>
      </div>

      {/* Grid Content */}
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