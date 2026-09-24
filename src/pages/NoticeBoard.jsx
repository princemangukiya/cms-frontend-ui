import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBullhorn, FaArrowLeft, FaPlus, FaTrash, FaClock,
  FaUsers, FaSearch, FaFilter, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaCalendarAlt, FaBriefcase, FaGraduationCap,
  FaUserShield, FaChalkboardTeacher, FaUserGraduate
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const DEFAULT_NOTICES = [
  {
    id: 1,
    notice_id: 1,
    title: "Mid-Term Examination Schedule Announced",
    category: "Urgent",
    audience: "All Students",
    author: "Principal Office",
    date: "Today, 10:30 AM",
    created_date: "Today, 10:30 AM",
    message: "The Semester End Mid-Term examinations will commence from September 15th, 2026. Detailed time-tables and seating arrangements are available in the Exam module.",
    priority: "high"
  },
  {
    id: 2,
    notice_id: 2,
    title: "Google & Microsoft Campus Placement Drive",
    category: "Placement",
    audience: "All Students",
    author: "Training & Placement Cell",
    date: "Yesterday",
    created_date: "Yesterday",
    message: "Upcoming placement drive for Software Development Engineer (SDE) roles. Eligible students must submit resumes before Friday 5:00 PM.",
    priority: "high"
  },
  {
    id: 3,
    notice_id: 3,
    title: "Annual Techno-Cultural Fest 'Technova 2026'",
    category: "Event",
    audience: "Everyone",
    author: "Student Welfare Committee",
    date: "2 days ago",
    created_date: "2 days ago",
    message: "Registrations are now open for Hackathon, Robotics Challenge, and Cultural Evening events. Exciting cash prizes worth ₹2,00,000!",
    priority: "medium"
  },
  {
    id: 4,
    notice_id: 4,
    title: "Department HOD & Curriculum Review Meeting",
    category: "Academic",
    audience: "HOD Only",
    author: "Principal Office",
    date: "3 days ago",
    created_date: "3 days ago",
    message: "Mandatory review meeting for all Heads of Departments (HODs) regarding NAAC accreditation, faculty workload, and syllabus completion.",
    priority: "high"
  },
  {
    id: 5,
    notice_id: 5,
    title: "Faculty Research Grant & Conference Submissions",
    category: "Academic",
    audience: "All Professors",
    author: "Dean Academics",
    date: "4 days ago",
    created_date: "4 days ago",
    message: "Faculty members are requested to submit their quarterly research proposals and national conference budget requisitions by month end.",
    priority: "medium"
  }
];

function NoticeBoard() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  // Role constants
  const isPrincipal = roleId === 2;
  const isHod = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;

  // Principal (2) and HOD (1) can post/delete notices
  const canManageNotices = isPrincipal || isHod;

  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem("cms_notices_list");
      return saved ? JSON.parse(saved) : DEFAULT_NOTICES;
    } catch (e) {
      return DEFAULT_NOTICES;
    }
  });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: "",
    category: "Academic",
    audience: "All Students",
    message: "",
    priority: "medium"
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    const headers = { "Content-Type": "application/json" };
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch notices from backend REST API
  const fetchNoticesFromBackend = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/notices?roleId=${roleId}`, {
        headers: getAuthHeaders()
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setNotices(res.data);
        localStorage.setItem("cms_notices_list", JSON.stringify(res.data));
        window.dispatchEvent(new CustomEvent("cms_notices_updated", { detail: res.data }));
      }
    } catch (err) {
      console.warn("Backend /api/notices unavailable, using local cache:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticesFromBackend();
  }, [roleId]);

  // Strict Audience matching based on logged-in user's role ID
  const isAudienceAllowedForRole = (audienceStr, uRoleId) => {
    if (!audienceStr) return true;
    const aud = audienceStr.trim().toLowerCase();

    // 1. General notices: Everyone / All Roles is visible to all
    if (aud === "everyone" || aud === "everyone (all roles)") {
      return true;
    }

    // 2. Principal (Role 2): Strictly sees Principal targeted notices only (NOT Students, NOT Professors, NOT HODs)
    if (uRoleId === 2) {
      return (
        aud.includes("principal") ||
        aud === "staff" ||
        aud === "all students & staff"
      );
    }

    // 3. Student (Role 4): Strictly sees Student targeted notices only (NOT Professors, NOT HODs, NOT Principal)
    if (uRoleId === 4) {
      return (
        aud.includes("student") ||
        aud === "all students & staff"
      );
    }

    // 4. Professor (Role 3): Strictly sees Professor targeted notices only (NOT Students, NOT HODs, NOT Principal)
    if (uRoleId === 3) {
      return (
        aud.includes("professor") ||
        aud.includes("faculty") ||
        aud === "all students & staff" ||
        aud === "staff"
      );
    }

    // 5. HOD (Role 1): Strictly sees HOD targeted notices only (NOT Students, NOT Professors, NOT Principal)
    if (uRoleId === 1) {
      return (
        aud.includes("hod") ||
        aud === "staff" ||
        aud === "all students & staff"
      );
    }

    // 6. Other roles (Librarian, Placement Officer)
    return aud === "all students & staff" || aud === "staff";
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.message.trim()) {
      alert("Please fill in both title and notice message!");
      return;
    }

    const payload = {
      title: newNotice.title.trim(),
      category: newNotice.category,
      audience: newNotice.audience,
      author: isPrincipal ? "Principal Office" : (user?.full_name ? `${user.full_name} (HOD)` : "HOD Department"),
      created_date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      message: newNotice.message.trim(),
      priority: newNotice.category === "Urgent" ? "high" : "medium"
    };

    try {
      const res = await axios.post("http://localhost:8080/api/notices", payload, {
        headers: getAuthHeaders()
      });
      if (res.data) {
        alert("Notice Published Successfully!");
        await fetchNoticesFromBackend();
        setNewNotice({ title: "", category: "Academic", audience: "All Students", message: "", priority: "medium" });
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error("Backend save failed:", err);
      const errMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        err.message;
      alert(`Error publishing notice to server: ${errMsg}`);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/notices/${id}`, {
        headers: getAuthHeaders()
      });
      alert("Notice Deleted Successfully!");
      await fetchNoticesFromBackend();
    } catch (err) {
      console.error("Backend delete notice failed:", err);
      const errMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string" ? err.response.data : "") ||
        err.message;
      alert(`Failed to delete notice: ${errMsg}`);
    }
  };

  const categories = ["All", "Urgent", "Placement", "Academic", "Event", "Holiday"];

  // Filter notices strictly by role audience, category, and search term
  const filteredNotices = notices.filter((item) => {
    // 1. Strict Role-based audience visibility
    if (!isAudienceAllowedForRole(item.audience, roleId)) {
      return false;
    }

    // 2. Category Filter
    const matchesCategory = selectedCategory === "All" || item.category?.toLowerCase() === selectedCategory.toLowerCase();

    // 4. Search Filter
    const matchesSearch =
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.message || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getCategoryBadgeStyle = (cat) => {
    switch ((cat || "").toLowerCase()) {
      case "urgent":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", border: "#ef4444" };
      case "placement":
        return { bg: "rgba(168, 85, 247, 0.15)", text: "#a855f7", border: "#a855f7" };
      case "event":
        return { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", border: "#10b981" };
      case "holiday":
        return { bg: "rgba(6, 182, 212, 0.15)", text: "#06b6d4", border: "#06b6d4" };
      default:
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", border: "#f59e0b" };
    }
  };

  const themeStyles = {
    pageBg: darkMode ? "linear-gradient(135deg, #090d16 0%, #111827 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 15px 35px rgba(0, 0, 0, 0.06)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
  };

  // Role badge info
  const getRoleIndicator = () => {
    if (isPrincipal) {
      return {
        icon: <FaUserShield color="#f59e0b" />,
        label: "Principal (Role 2)",
        desc: "Full Administration Access — Viewing and publishing circulars for all college audiences",
        badgeBg: "rgba(245, 158, 11, 0.15)",
        badgeText: "#f59e0b"
      };
    }
    if (isHod) {
      return {
        icon: <FaChalkboardTeacher color="#3b82f6" />,
        label: "Head of Department (Role 1)",
        desc: "Department Access — Viewing notices targeted to HODs, Professors, and College-wide circulars",
        badgeBg: "rgba(59, 130, 246, 0.15)",
        badgeText: "#3b82f6"
      };
    }
    if (isProfessor) {
      return {
        icon: <FaChalkboardTeacher color="#10b981" />,
        label: "Professor / Faculty (Role 3)",
        desc: "Faculty Access — Viewing notices targeted to Professors, Academic Staff, and College announcements",
        badgeBg: "rgba(16, 185, 129, 0.15)",
        badgeText: "#10b981"
      };
    }
    return {
      icon: <FaUserGraduate color="#8b5cf6" />,
      label: "Student (Role 4)",
      desc: "Student Access — Viewing notices targeted to Students, Placements, Exams, and College announcements",
      badgeBg: "rgba(139, 92, 246, 0.15)",
      badgeText: "#8b5cf6"
    };
  };

  const roleInfo = getRoleIndicator();

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header Card */}
        <div style={{
          background: "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)",
          borderRadius: "24px", padding: "30px 36px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 12px 30px rgba(234, 88, 12, 0.3)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaBullhorn size={26} />
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Campus Digital Notice Board</h1>
            </div>
            <p style={{ margin: "6px 0 0 48px", opacity: 0.9, fontSize: "14px" }}>
              Official college circulars, urgent announcements, and academic updates
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {canManageNotices && (
              <button onClick={() => setShowCreateModal(true)} style={{
                display: "flex", alignItems: "center", gap: "8px", background: "#ffffff",
                color: "#ea580c", padding: "12px 22px", borderRadius: "14px", border: "none",
                fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
              }}>
                <FaPlus /> Post New Notice
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} style={{
              display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.4)", color: "#ffffff", padding: "12px 20px",
              borderRadius: "14px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
            }}>
              <FaArrowLeft /> Dashboard
            </button>
          </div>
        </div>

        {/* Role Identity Banner */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "16px", padding: "14px 20px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "18px" }}>{roleInfo.icon}</span>
            <div>
              <span style={{
                padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800",
                background: roleInfo.badgeBg, color: roleInfo.badgeText, marginRight: "8px"
              }}>
                {roleInfo.label}
              </span>
              <span style={{ fontSize: "13px", color: themeStyles.textSecondary }}>
                {roleInfo.desc}
              </span>
            </div>
          </div>
          <div style={{ fontSize: "12px", color: themeStyles.textSecondary, fontWeight: "600" }}>
            Showing: <strong style={{ color: themeStyles.textPrimary }}>{filteredNotices.length}</strong> circulars
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "20px", padding: "18px 24px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
        }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 16px", borderRadius: "12px", border: "none", fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", transition: "all 0.2s ease",
                  background: selectedCategory === cat
                    ? "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)"
                    : (darkMode ? "#0f172a" : "#f1f5f9"),
                  color: selectedCategory === cat ? "#ffffff" : themeStyles.textSecondary,
                  boxShadow: selectedCategory === cat ? "0 4px 12px rgba(234, 88, 12, 0.3)" : "none"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Search Box */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px", background: themeStyles.inputBg,
              padding: "8px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, width: "240px"
            }}>
              <FaSearch color={themeStyles.textSecondary} size={14} />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: themeStyles.textPrimary, fontSize: "13px", width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Notices Cards Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filteredNotices.length === 0 ? (
            <div style={{
              background: themeStyles.cardBg, borderRadius: "20px", padding: "60px 20px", textAlign: "center",
              border: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary
            }}>
              <FaBullhorn size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
              <h3 style={{ margin: 0, color: themeStyles.textPrimary }}>No Notices Found</h3>
              <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>There are no circulars matching your current filter.</p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const badgeStyle = getCategoryBadgeStyle(notice.category);
              const noticeId = notice.notice_id || notice.id;
              const noticeDate = notice.created_date || notice.date || "Recent";

              return (
                <div
                  key={noticeId}
                  style={{
                    background: themeStyles.cardBg, borderRadius: "20px", padding: "26px 30px",
                    border: `1.5px solid ${notice.priority === 'high' ? 'rgba(239, 68, 68, 0.4)' : themeStyles.cardBorder}`,
                    boxShadow: notice.priority === 'high' ? '0 10px 30px rgba(239, 68, 68, 0.1)' : themeStyles.cardShadow,
                    display: "flex", flexDirection: "column", gap: "14px", position: "relative",
                    transition: "transform 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                        background: badgeStyle.bg, color: badgeStyle.text, border: `1px solid ${badgeStyle.border}`,
                        textTransform: "uppercase"
                      }}>
                        {notice.category}
                      </span>
                      <span style={{
                        padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                        background: darkMode ? "#0f172a" : "#f1f5f9", color: themeStyles.textSecondary
                      }}>
                        🎯 Target: {notice.audience}
                      </span>
                      <span style={{ fontSize: "12px", color: themeStyles.textSecondary, display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaClock size={11} /> {noticeDate}
                      </span>
                    </div>

                    {canManageNotices && (
                      <button
                        onClick={() => handleDeleteNotice(noticeId)}
                        style={{
                          background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: "700"
                        }}
                      >
                        <FaTrash size={12} /> Delete
                      </button>
                    )}
                  </div>

                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: themeStyles.textPrimary }}>
                    {notice.title}
                  </h3>

                  <p style={{ margin: 0, fontSize: "14px", color: themeStyles.textSecondary, lineHeight: "1.6" }}>
                    {notice.message}
                  </p>

                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderTop: `1px solid ${themeStyles.cardBorder}`, paddingTop: "12px", fontSize: "12px", flexWrap: "wrap", gap: "8px"
                  }}>
                    <span style={{ fontWeight: "800", color: "#ea580c" }}>
                      🏛️ Issued By: <span style={{ color: themeStyles.textPrimary }}>{notice.author || "Principal Office"}</span>
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "8px",
                      background: "rgba(234, 88, 12, 0.12)", color: "#ea580c", border: "1px solid rgba(234, 88, 12, 0.25)"
                    }}>
                      🎯 Target: {notice.audience}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE NOTICE MODAL */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "36px", maxWidth: "560px", width: "92%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${themeStyles.cardBorder}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
                📢 Post New College Circular
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: themeStyles.textSecondary, cursor: "pointer", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>CIRCULAR TITLE *</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Placement Drive Notice"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  required
                  style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>CATEGORY *</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  >
                    <option value="Urgent">🔴 Urgent</option>
                    <option value="Placement">💼 Placement</option>
                    <option value="Academic">🟡 Academic</option>
                    <option value="Event">🟢 Event</option>
                    <option value="Holiday">🔵 Holiday</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>TARGET AUDIENCE *</label>
                  <select
                    value={newNotice.audience}
                    onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })}
                    style={{ padding: "12px 14px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  >
                    <option value="All Students">🎓 All Students (Only Students View)</option>
                    <option value="Final Year Students">🎓 Final Year Students (Only Students View)</option>
                    <option value="All Professors">👨‍🏫 All Professors (Only Professors View)</option>
                    <option value="All HODs">🏛️ All HODs (Only HODs View)</option>
                    <option value="All Principal">👑 All Principal (Only Principal View)</option>
                    <option value="Everyone">🌐 Everyone (All Roles View)</option>
                    <option value="All Students & Staff">👥 All Students & Staff</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>NOTICE DESCRIPTION & DETAILS *</label>
                <textarea
                  rows="4"
                  placeholder="Write the complete circular details here..."
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                  required
                  style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: "12px 24px", borderRadius: "12px", border: `1px solid ${themeStyles.inputBorder}`, background: "none", color: themeStyles.textSecondary, fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "12px 30px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)", color: "white", fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 20px rgba(234, 88, 12, 0.4)" }}>Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoticeBoard;