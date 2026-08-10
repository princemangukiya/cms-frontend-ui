import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaBookOpen, FaChartBar, FaClipboardCheck, FaTasks, FaRegCalendarAlt, FaUniversity, FaDollarSign, FaSuitcase, FaBuilding, FaMoneyBillWave, FaComments, FaTrophy } from 'react-icons/fa';
import TopBar from "../components/TopBar";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const moduleConfig = {
  Student: { icon: FaUserGraduate, color: "#6366f1", bgLight: "#e0e7ff", bgDark: "rgba(99, 102, 241, 0.2)" },
  Staff: { icon: FaChalkboardTeacher, color: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
  Course: { icon: FaBook, color: "#0284c7", bgLight: "#e0f2fe", bgDark: "rgba(2, 132, 199, 0.2)" },
  Subject: { icon: FaBookOpen, color: "#10b981", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" },
  Result: { icon: FaChartBar, color: "#ec4899", bgLight: "#fce7f3", bgDark: "rgba(236, 72, 153, 0.2)" },
  Attendance: { icon: FaClipboardCheck, color: "#8b5cf6", bgLight: "#ede9fe", bgDark: "rgba(139, 92, 246, 0.2)" },
  "Book Issue": { icon: FaTasks, color: "#eab308", bgLight: "#fef9c3", bgDark: "rgba(234, 179, 8, 0.2)" },
  "Class Mgmt": { icon: FaUniversity, color: "#3b82f6", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
  Exam: { icon: FaRegCalendarAlt, color: "#059669", bgLight: "#d1fae5", bgDark: "rgba(5, 150, 105, 0.2)" },
  Feedback: { icon: FaComments, color: "#f43f5e", bgLight: "#ffe4e6", bgDark: "rgba(244, 63, 94, 0.2)" },
  Fees: { icon: FaDollarSign, color: "#4f46e5", bgLight: "#e0e7ff", bgDark: "rgba(79, 70, 229, 0.2)" },
  Holiday: { icon: FaRegCalendarAlt, color: "#f97316", bgLight: "#ffedd5", bgDark: "rgba(249, 115, 22, 0.2)" },
  Library: { icon: FaBookOpen, color: "#06b6d4", bgLight: "#cffafe", bgDark: "rgba(6, 182, 212, 0.2)" },
  Payment: { icon: FaMoneyBillWave, color: "#10b981", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" },
  "Company Placement": { icon: FaBuilding, color: "#d946ef", bgLight: "#fae8ff", bgDark: "rgba(217, 70, 239, 0.2)" },
  "Placement Student": { icon: FaSuitcase, color: "#a855f7", bgLight: "#f3e8ff", bgDark: "rgba(168, 85, 247, 0.2)" },
};

function Dashboard() {
  const navigate = useNavigate();
  const themeContext = useTheme();

  // Dynamic Theme Fallback check
  const darkMode = themeContext?.darkMode ?? false;

  const [searchTerm, setSearchTerm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("userProfilePic") || DEFAULT_AVATAR;
  });

  const fileInputRef = useRef(null);

  // Load user data
  const loadUserData = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const email = user?.emailId || localStorage.getItem("userEmail") || "v12@gmail.com";
    setUserEmail(email);

    if (user?.fullName && user.fullName.trim() !== '') {
      setDisplayName(user.fullName);
    } else {
      const rawName = email.split("@")[0];
      setDisplayName(rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase());
    }

    const savedImage = localStorage.getItem("userProfilePic");
    if (savedImage) setProfileImage(savedImage);
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener("profileUpdated", loadUserData);
    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("profileUpdated", loadUserData);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);
        localStorage.setItem("userProfilePic", base64Image);
        window.dispatchEvent(new Event("profileUpdated"));
      };
      reader.readAsDataURL(file);
    }
  };

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

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Ultra Premium Theme Styling Map
  const themeStyles = {
    bgMain: darkMode
      ? "radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 40%, #020617 100%)"
      : "radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 40%, #f1f5f9 100%)",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    sidebarBg: darkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
    sidebarBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.8)",
    profileBg: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.8)",
    profileBorder: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(203, 213, 225, 0.6)",
    cardBg: darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.85)",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)",
    cardShadow: darkMode ? "0 20px 40px -15px rgba(0, 0, 0, 0.5)" : "0 15px 35px -10px rgba(0, 0, 0, 0.05)",
    navBtnBg: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.8)",
    navBtnText: darkMode ? "#cbd5e1" : "#475569"
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      background: themeStyles.bgMain,
      color: themeStyles.textPrimary,
      margin: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.4s ease, color 0.4s ease"
    }}>
      {/* Sidebar Area */}
      <div style={{
        width: "290px",
        background: themeStyles.sidebarBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: themeStyles.textPrimary,
        padding: "28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        borderRight: `1px solid ${themeStyles.sidebarBorder}`,
        boxShadow: "10px 0 30px rgba(0, 0, 0, 0.04)",
        boxSizing: "border-box",
        transition: "all 0.3s ease",
        zIndex: 20
      }}>
        {/* Brand Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "6px" }}>
          <div style={{
            width: "12px",
            height: "24px",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            borderRadius: "6px"
          }} />
          <h2 style={{
            fontSize: "24px",
            margin: "0",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            CMS Portal
          </h2>
        </div>

        {/* Top Profile Card Block */}
        <div style={{
          background: themeStyles.profileBg,
          backdropFilter: "blur(12px)",
          padding: "24px 18px",
          borderRadius: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          border: `1px solid ${themeStyles.profileBorder}`,
          boxShadow: darkMode ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.03)",
          transition: "all 0.3s ease"
        }}>
          {/* Hidden File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {/* Profile Picture Circle with Glowing Border */}
          <div
            onClick={handleAvatarClick}
            title="Click to change profile picture"
            style={{
              position: "relative",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              cursor: "pointer",
              padding: "3px",
              background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
              boxShadow: "0 8px 20px rgba(168, 85, 247, 0.35)",
              marginBottom: "14px",
              transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: darkMode ? "#0f172a" : "#ffffff",
              position: "relative"
            }}>
              <img
                src={profileImage}
                alt="Profile Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              <div style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#ffffff",
                fontSize: "10px",
                width: "100%",
                textAlign: "center",
                padding: "3px 0",
                fontWeight: "700",
                letterSpacing: "0.5px"
              }}>✏️ Edit</div>
            </div>
          </div>

          {/* User Information */}
          <span style={{ fontSize: "11px", color: themeStyles.textSecondary, letterSpacing: "1.5px", fontWeight: "800" }}>
            WELCOME BACK
          </span>
          <span style={{ fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary, marginTop: "4px", letterSpacing: "-0.3px" }}>
            {displayName}
          </span>
          <span style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "2px", wordBreak: "break-all", maxWidth: "100%", fontWeight: "500" }}>
            {userEmail}
          </span>

          {/* Manage Profile Link */}
          <span
            onClick={() => navigate("/profile")}
            style={{
              fontSize: "13px",
              color: "#6366f1",
              fontWeight: "700",
              cursor: "pointer",
              marginTop: "12px",
              transition: "opacity 0.2s ease"
            }}
            onMouseOver={(e) => e.target.style.opacity = "0.75"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            Manage Profile →
          </span>

          {/* Log Out Button */}
          <button
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              padding: "10px 20px",
              borderRadius: "14px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "700",
              marginTop: "16px",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#ef4444";
              e.target.style.color = "#ffffff";
              e.target.style.boxShadow = "0 8px 20px rgba(239, 68, 68, 0.35)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.08)";
              e.target.style.color = "#ef4444";
              e.target.style.boxShadow = "none";
            }}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        {/* Navigation Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              cursor: "pointer",
              fontSize: "14px",
              color: "#ffffff",
              padding: "14px 18px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              borderRadius: "16px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              boxShadow: "0 10px 25px rgba(99, 102, 241, 0.35)",
              transition: "transform 0.2s ease"
            }}
            onClick={() => navigate("/dashboard")}
          >
            <FaChartBar size={18} /> Home Dashboard
          </div>

          <div
            style={{
              cursor: "pointer",
              fontSize: "14px",
              color: themeStyles.navBtnText,
              padding: "14px 18px",
              background: themeStyles.navBtnBg,
              border: `1px solid ${themeStyles.profileBorder}`,
              borderRadius: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.color = themeStyles.textPrimary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.color = themeStyles.navBtnText;
            }}
            onClick={() => navigate("/sports")}
          >
            <FaTrophy size={18} color="#f59e0b" /> Sports
          </div>

          <div
            style={{
              cursor: "pointer",
              fontSize: "14px",
              color: themeStyles.navBtnText,
              padding: "14px 18px",
              background: themeStyles.navBtnBg,
              border: `1px solid ${themeStyles.profileBorder}`,
              borderRadius: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.color = themeStyles.textPrimary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.color = themeStyles.navBtnText;
            }}
            onClick={() => navigate("/function")}
          >
            <FaRegCalendarAlt size={18} color="#ec4899" /> Function
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "32px 44px", overflowY: "auto", zIndex: 10 }}>
        <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div style={{
          fontSize: "28px",
          fontWeight: "800",
          margin: "32px 0 28px 0",
          color: themeStyles.textPrimary,
          letterSpacing: "-0.8px"
        }}>
          Dashboard Overview
        </div>

        {/* Dynamic Card Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "26px"
        }}>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => {
              const config = moduleConfig[item.name] || moduleConfig.Student;
              const IconComponent = config.icon;
              const cardIconBg = darkMode ? config.bgDark : config.bgLight;

              return (
                <div
                  key={item.name}
                  style={{
                    background: themeStyles.cardBg,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    padding: "30px 24px 24px 24px",
                    borderRadius: "26px",
                    boxShadow: themeStyles.cardShadow,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    border: `1px solid ${themeStyles.cardBorder}`,
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.borderColor = config.color;
                    e.currentTarget.style.boxShadow = `0 20px 40px -10px ${config.color}35`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.borderColor = themeStyles.cardBorder;
                    e.currentTarget.style.boxShadow = themeStyles.cardShadow;
                  }}
                >
                  {/* Top Ambient Soft Glow */}
                  <div style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-30px",
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    background: config.color,
                    filter: "blur(40px)",
                    opacity: darkMode ? 0.3 : 0.15,
                    pointerEvents: "none"
                  }} />

                  <div style={{
                    background: cardIconBg,
                    padding: "20px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                    boxShadow: `0 8px 20px ${config.color}25`
                  }}>
                    <IconComponent size={30} color={config.color} />
                  </div>

                  <h3 style={{ margin: "0 0 22px 0", fontSize: "19px", fontWeight: "800", color: themeStyles.textPrimary, letterSpacing: "-0.3px" }}>
                    {item.name}
                  </h3>

                  <button
                    onClick={() => navigate(item.path)}
                    style={{
                      background: `linear-gradient(135deg, ${config.color} 0%, #a855f7 100%)`,
                      color: "white",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      width: "100%",
                      boxShadow: `0 8px 18px ${config.color}35`,
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                    onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Add Detail
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: themeStyles.textSecondary, fontSize: "16px", fontWeight: "600" }}>
              No matching modules found for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;