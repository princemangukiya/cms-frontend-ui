import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LogOut,
  Camera,
  GraduationCap,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

function Sidebar() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? true;

  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("userProfilePic") || DEFAULT_AVATAR;
  });

  const fileInputRef = useRef(null);

  const loadUserData = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const email = user?.emailId || localStorage.getItem("userEmail") || localStorage.getItem("email") || "sarthak123@gmail.com";

    setUserEmail(email);

    if (user?.fullName && user.fullName.trim() !== '') {
      setDisplayName(user.fullName);
    } else if (email) {
      const rawName = email.split("@")[0];
      setDisplayName(rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase());
    } else {
      setDisplayName("User");
    }

    const savedImg = localStorage.getItem("userProfilePic");
    if (savedImg) setProfileImage(savedImg);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* Component Specific Modern CSS */}
      <style>{`
        .cms-sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 16px;
          border-radius: 12px;
          color: #94a3b8;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .cms-sidebar-link:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
          transform: translateX(4px);
        }
        .cms-sidebar-link.active {
          color: #ffffff !important;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .cms-avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cms-avatar-container:hover .cms-avatar-overlay {
          opacity: 1;
        }
        .cms-logout-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
          padding: 12px 16px;
          cursor: pointer;
          border-radius: 12px;
          width: 100%;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.25s ease;
        }
        .cms-logout-btn:hover {
          background: #ef4444;
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{
        width: "270px",
        height: "100vh",
        background: darkMode
          ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)'
          : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: "#f8fafc",
        padding: "24px 18px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        boxShadow: "5px 0 25px rgba(0,0,0,0.35)",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 100
      }}>
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 18px rgba(37, 99, 235, 0.4)'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: "19px", margin: 0, fontWeight: "800", letterSpacing: "-0.5px", color: "#ffffff" }}>
              CMS Portal
            </h2>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
              Management System
            </span>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          padding: "12px",
          borderRadius: "16px",
          marginBottom: "28px"
        }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          <div
            className="cms-avatar-container"
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              minWidth: "48px",
              borderRadius: "50%",
              cursor: "pointer",
              overflow: "hidden",
              border: "2px solid #2563eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}
            onClick={handleAvatarClick}
            title="Click to change profile picture"
          >
            <img
              src={profileImage}
              alt="Profile Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="cms-avatar-overlay">
              <Camera size={16} color="#ffffff" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <span style={{
              fontWeight: "700",
              fontSize: "14px",
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {displayName}
            </span>
            <span style={{
              fontSize: "11px",
              color: "#94a3b8",
              margin: "2px 0 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }} title={userEmail}>
              {userEmail}
            </span>
          </div>
        </div>

        {/* Navigation Group */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <NavLink to="/dashboard" className="cms-sidebar-link">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>

          <NavLink to="/student" className="cms-sidebar-link">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Users size={18} />
              <span>Student Portal</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>

          <NavLink to="/profile" className="cms-sidebar-link">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <UserCheck size={18} />
              <span>Manage Profile</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </NavLink>
        </nav>

        {/* Logout Button Footer */}
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <button type="button" className="cms-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;