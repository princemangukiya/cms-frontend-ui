
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCommentDots, FaStar, FaUser, FaArrowLeft,
  FaPaperPlane, FaSearch, FaFilter, FaCheckCircle,
  FaGraduationCap, FaChalkboardTeacher, FaUserTie,
  FaCrown, FaBook
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Feedback() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const getUserData = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return {};
    }
  };

  const user = getUserData();
  const currentUserId = Number(user?.user_id || user?.userId || user?.id || 1);
  const currentRoleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const currentFullName = user?.fullName || user?.full_name || user?.emailId || "User";

  const roleNames = { 1: "HOD", 2: "Principal", 3: "Professor", 4: "Student", 5: "Librarian", 6: "Placement Officer" };
  const currentRoleName = roleNames[currentRoleId] || "User";
  const isPrincipal = currentRoleId === 2;

  const [recipientsList, setRecipientsList] = useState([]);
  const [feedback, setFeedback] = useState({
    feedbackFrom: currentUserId,
    feedbackTo: "",
    rating: 5,
    feedbackMessage: "",
  });

  const [receivedFeedbacks, setReceivedFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    const headers = { "Content-Type": "application/json" };
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // 🎯 Fetch eligible recipients dynamically based on strict College Hierarchy
  const fetchRecipients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/feedback/recipients", {
        headers: getAuthHeaders()
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setRecipientsList(data);
      if (data.length > 0) {
        setFeedback(prev => ({
          ...prev,
          feedbackTo: data[0].userId
        }));
      }
    } catch (err) {
      console.error("Error fetching feedback recipients:", err);
    }
  };

  // 🎯 Fetch feedbacks (Backend returns isolated feedbacks for non-principal; all feedbacks for principal)
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/feedback", {
        headers: getAuthHeaders()
      });

      const all = Array.isArray(response.data) ? response.data : [];
      setReceivedFeedbacks(all);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
    fetchFeedbacks();
  }, [currentRoleId, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: name === "feedbackTo" || name === "rating" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.feedbackTo) {
      alert("Please select a recipient for your feedback.");
      return;
    }

    if (!feedback.feedbackMessage.trim()) {
      alert("Please enter your feedback message.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        feedback_from: Number(currentUserId),
        feedbackFrom: Number(currentUserId),
        feedback_to: Number(feedback.feedbackTo),
        feedbackTo: Number(feedback.feedbackTo),
        rating: Number(feedback.rating),
        feedback_message: feedback.feedbackMessage.trim(),
        feedbackMessage: feedback.feedbackMessage.trim()
      };

      await axios.post("http://localhost:8080/api/feedback", payload, {
        headers: getAuthHeaders()
      });

      alert("Feedback Submitted Successfully!");

      setFeedback(prev => ({
        ...prev,
        feedbackMessage: ""
      }));

      fetchFeedbacks();
    } catch (error) {
      console.error("Error saving feedback:", error);
      const errMsg =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : "") ||
        error.message ||
        "Unknown error";
      alert(`Error saving feedback: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render role badge
  const renderRoleBadge = (roleName, roleId) => {
    const rName = roleName || roleNames[roleId] || "User";
    let bg = "rgba(99, 102, 241, 0.15)";
    let color = "#6366f1";
    let Icon = FaUser;

    if (rName.includes("Professor") || Number(roleId) === 3) {
      bg = "rgba(16, 185, 129, 0.15)";
      color = "#10b981";
      Icon = FaChalkboardTeacher;
    } else if (rName.includes("HOD") || Number(roleId) === 1) {
      bg = "rgba(245, 158, 11, 0.15)";
      color = "#f59e0b";
      Icon = FaUserTie;
    } else if (rName.includes("Principal") || Number(roleId) === 2) {
      bg = "rgba(139, 92, 246, 0.15)";
      color = "#8b5cf6";
      Icon = FaCrown;
    } else if (rName.includes("Librarian") || Number(roleId) === 5) {
      bg = "rgba(6, 182, 212, 0.15)";
      color = "#06b6d4";
      Icon = FaBook;
    } else if (rName.includes("Student") || Number(roleId) === 4) {
      bg = "rgba(99, 102, 241, 0.15)";
      color = "#6366f1";
      Icon = FaGraduationCap;
    }

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: "700",
        background: bg,
        color: color,
        border: `1px solid ${color}30`
      }}>
        <Icon size={11} /> {rName}
      </span>
    );
  };

  // Group recipients for nice dropdown presentation
  const groupedRecipients = recipientsList.reduce((acc, curr) => {
    const rName = curr.roleName || "Other";
    if (!acc[rName]) acc[rName] = [];
    acc[rName].push(curr);
    return acc;
  }, {});

  // Filter feedbacks for search and role filter
  const filteredFeedbacks = receivedFeedbacks.filter(f => {
    const sName = (f.sender_name || f.senderName || "").toLowerCase();
    const rName = (f.recipient_name || f.recipientName || "").toLowerCase();
    const msg = (f.feedback_message || f.feedbackMessage || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = sName.includes(term) || rName.includes(term) || msg.includes(term);

    if (roleFilter === "All") return matchesSearch;
    const targetRole = f.recipient_role || f.recipientRole || "";
    return matchesSearch && targetRole.toLowerCase() === roleFilter.toLowerCase();
  });

  const themeStyles = {
    pageBg: darkMode ? "linear-gradient(135deg, #090d16 0%, #0f172a 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.5)" : "0 15px 35px rgba(0, 0, 0, 0.08)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    tableHeaderBg: darkMode ? "#0f172a" : "#f1f5f9",
    tableBorder: darkMode ? "#334155" : "#e2e8f0",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Top Header */}
      <div style={{
        width: "100%", maxWidth: "900px", display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
              color: "#ffffff", padding: "10px", borderRadius: "14px", display: "flex", alignItems: "center"
            }}>
              <FaCommentDots size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: themeStyles.textPrimary }}>
              College Feedback Portal
            </h1>
          </div>
          <p style={{ margin: "6px 0 0 0", color: themeStyles.textSecondary, fontSize: "13px" }}>
            {isPrincipal
              ? "👑 Principal Super-Admin View • Complete College-wide Feedback Directory"
              : `Logged in as: ${currentFullName} (${currentRoleName} #${currentUserId})`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            padding: "10px 20px", background: darkMode ? "#334155" : "#ffffff",
            border: `1px solid ${themeStyles.inputBorder}`, color: themeStyles.textPrimary,
            borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>
      </div>

      {/* 📝 Feedback Submission Form (Visible for Student, Professor, HOD, Librarian) */}
      {!isPrincipal && (
        <div style={{
          width: "100%", maxWidth: "900px", background: themeStyles.cardBg, borderRadius: "24px",
          boxShadow: themeStyles.cardShadow, border: `1px solid ${themeStyles.cardBorder}`, marginBottom: "32px", overflow: "hidden"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f43f5e 100%)",
            padding: "24px 28px", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Submit Feedback</h2>
              <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: "13px" }}>
                Send feedback directly to your authorized college authorities
              </p>
            </div>
            <span style={{
              background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(8px)",
              padding: "6px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "700"
            }}>
              Your Role: {currentRoleName}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Sender Details (Auto-filled) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase" }}>
                  Feedback Sender (You)
                </label>
                <div style={{
                  padding: "12px 14px", borderRadius: "12px", border: `2px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg, color: themeStyles.textPrimary, fontWeight: "700", fontSize: "14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <span>{currentFullName}</span>
                  {renderRoleBadge(currentRoleName, currentRoleId)}
                </div>
              </div>

              {/* Recipient Dropdown (Filtered by Hierarchy) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase" }}>
                  Send Feedback To <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {recipientsList.length > 0 ? (
                  <select
                    name="feedbackTo"
                    value={feedback.feedbackTo}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                      color: themeStyles.textPrimary, fontWeight: "700", fontSize: "13.5px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="">-- Select Recipient --</option>
                    {Object.keys(groupedRecipients).map((groupName) => (
                      <optgroup key={groupName} label={`▼ ${groupName}s`}>
                        {groupedRecipients[groupName].map((r) => (
                          <option key={r.userId} value={r.userId}>
                            [{r.roleName}] {r.name} (ID #{r.userId})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: "12px", borderRadius: "12px", background: themeStyles.inputBg, color: themeStyles.textSecondary, fontSize: "13px" }}>
                    No eligible recipients found for your role.
                  </div>
                )}
              </div>

              {/* Rating */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase" }}>
                  Rating (Experience) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="rating"
                  value={feedback.rating}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                    color: themeStyles.textPrimary, fontWeight: "700", fontSize: "13.5px", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Excellent (Highly Satisfied)</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Good (Very Good)</option>
                  <option value={3}>⭐⭐⭐ 3 - Average (Satisfactory)</option>
                  <option value={2}>⭐⭐ 2 - Below Average (Needs Improvement)</option>
                  <option value={1}>⭐ 1 - Poor (Unsatisfactory)</option>
                </select>
              </div>

              {/* Hierarchy Notice Note */}
              <div style={{
                display: "flex", flexDirection: "column", justifyContent: "center",
                padding: "12px 16px", borderRadius: "12px", background: darkMode ? "rgba(99, 102, 241, 0.1)" : "#f0fdf4",
                border: `1px dashed ${darkMode ? "#6366f1" : "#86efac"}`, fontSize: "12px", color: themeStyles.textSecondary
              }}>
                <span style={{ fontWeight: "700", color: darkMode ? "#a5b4fc" : "#15803d", marginBottom: "2px" }}>
                  🔒 Strict Privacy Rule:
                </span>
                Your feedback is directly delivered to the selected person's private inbox and Principal's review portal.
              </div>

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase" }}>
                  Feedback Message <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  name="feedbackMessage"
                  value={feedback.feedbackMessage}
                  onChange={handleChange}
                  placeholder="Write your honest, detailed feedback or suggestions here..."
                  required
                  rows={4}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px",
                    border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                    color: themeStyles.textPrimary, fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 36px", background: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)",
                  color: "#ffffff", border: "none", borderRadius: "12px", cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "800", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 8px 20px rgba(236, 72, 153, 0.35)", opacity: submitting ? 0.7 : 1
                }}
              >
                <FaPaperPlane size={13} /> {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📋 Feedbacks Directory Table (Isolated by User / Role) */}
      <div style={{
        width: "100%", maxWidth: "900px", background: themeStyles.cardBg, borderRadius: "24px",
        padding: "32px", boxShadow: themeStyles.cardShadow, border: `1px solid ${themeStyles.cardBorder}`
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "24px", flexWrap: "wrap", gap: "14px"
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
              {isPrincipal ? "👑 All College Feedbacks (Principal Review Portal)" : `Feedbacks for ${currentFullName} (${currentRoleName})`}
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: themeStyles.textSecondary }}>
              {isPrincipal
                ? `Displaying all college-wide submitted feedbacks (${receivedFeedbacks.length} total)`
                : `Displaying feedbacks specifically sent to you or submitted by you (${receivedFeedbacks.length} total)`}
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", background: themeStyles.inputBg,
              border: `1px solid ${themeStyles.inputBorder}`, borderRadius: "10px", padding: "8px 12px"
            }}>
              <FaSearch size={12} color={themeStyles.textSecondary} style={{ marginRight: "8px" }} />
              <input
                type="text"
                placeholder="Search sender, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  color: themeStyles.textPrimary, fontSize: "13px", width: "160px"
                }}
              />
            </div>

            {isPrincipal && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: "10px", border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg, color: themeStyles.textPrimary, fontSize: "13px", fontWeight: "600"
                }}
              >
                <option value="All">All Targets</option>
                <option value="Professor">To Professors</option>
                <option value="HOD">To HODs</option>
                <option value="Principal">To Principal</option>
                <option value="Librarian">To Librarian</option>
              </select>
            )}

            <button
              type="button"
              onClick={fetchFeedbacks}
              style={{
                padding: "8px 14px", background: darkMode ? "#334155" : "#e2e8f0",
                color: themeStyles.textPrimary, border: "none", borderRadius: "10px",
                cursor: "pointer", fontWeight: "700", fontSize: "12px"
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px", color: themeStyles.textPrimary }}>
            <thead>
              <tr style={{ background: themeStyles.tableHeaderBg, borderBottom: `2px solid ${themeStyles.inputBorder}` }}>
                <th style={{ padding: "14px 12px" }}>ID</th>
                <th style={{ padding: "14px 12px" }}>Sender</th>
                <th style={{ padding: "14px 12px" }}>Sent To (Recipient)</th>
                <th style={{ padding: "14px 12px" }}>Rating</th>
                <th style={{ padding: "14px 12px" }}>Feedback Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "28px", color: themeStyles.textSecondary }}>Loading feedbacks...</td></tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "28px", color: themeStyles.textSecondary }}>No feedback records found.</td></tr>
              ) : (
                filteredFeedbacks.map((item, index) => {
                  const sName = item.sender_name || item.senderName || `User #${item.feedback_from || item.feedbackFrom}`;
                  const sRole = item.sender_role || item.senderRole || "User";
                  const rName = item.recipient_name || item.recipientName || `User #${item.feedback_to || item.feedbackTo}`;
                  const rRole = item.recipient_role || item.recipientRole || "User";
                  const rating = Number(item.rating || 5);
                  const msg = item.feedback_message || item.feedbackMessage || "-";
                  const fId = item.feedback_id || item.feedbackId;

                  return (
                    <tr key={index} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}`, transition: "background 0.2s" }}>
                      <td style={{ padding: "14px 12px", fontWeight: "800", color: "#ec4899" }}>
                        #FDB-{fId}
                      </td>

                      {/* Sender */}
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                          {sName}
                        </div>
                        <div style={{ marginTop: "3px" }}>
                          {renderRoleBadge(sRole)}
                        </div>
                      </td>

                      {/* Sent To */}
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                          {rName}
                        </div>
                        <div style={{ marginTop: "3px" }}>
                          {renderRoleBadge(rRole)}
                        </div>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: "14px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontWeight: "800", color: "#f59e0b", fontSize: "14px" }}>
                            {rating} / 5
                          </span>
                        </div>
                        <div style={{ color: "#f59e0b", fontSize: "12px", marginTop: "2px" }}>
                          {"★".repeat(rating)}{"☆".repeat(Math.max(0, 5 - rating))}
                        </div>
                      </td>

                      {/* Message */}
                      <td style={{ padding: "14px 12px", maxWidth: "300px", lineHeight: "1.5" }}>
                        <div style={{
                          background: darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                          padding: "8px 12px", borderRadius: "10px", border: `1px solid ${themeStyles.inputBorder}`
                        }}>
                          {msg}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Feedback;