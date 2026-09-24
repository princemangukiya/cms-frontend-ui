import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaUser, FaCalendarAlt,
  FaMoneyBillWave, FaCommentDots, FaArrowLeft, FaSave, FaSearch
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import "./BookIssue.css";

const BookIssue = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // Role IDs: HOD = 1, Principal = 2, Professor = 3, Student = 4, Librarian = 5
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id ?? user?.roleId ?? user?.role?.role_id ?? 4);

  const isLibrarian = roleId === 5;
  const isPrincipal = roleId === 2;
  const isProfessor = roleId === 3;
  const isHOD = roleId === 1;
  const isStudent = roleId === 4;

  // Sirf Librarian (Role 5) hi add/issue kar sakta hai
  const canAddBookIssue = isLibrarian;

  // Toggle for Librarian to switch between Personal View and Master View (Default: Personal View)
  const [librarianShowAll, setLibrarianShowAll] = useState(false);

  // Sabhi roles (Principal, Student, Professor, HOD) ke liye strictly Personal View rahega ("sirf uski id ka hi rakho")
  const isPersonalView = !isLibrarian || !librarianShowAll;

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [bookIssueList, setBookIssueList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserFilter, setSelectedUserFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '', userId: '', issueDate: getTodayDate(), fine: '', reason: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchContextData = async () => {
    const headers = getAuthHeaders();
    try {
      let bRes;
      try {
        bRes = await axios.get("http://localhost:8080/library/all", { headers });
      } catch {
        bRes = await axios.get("http://localhost:8080/api/library", { headers });
      }
      if (bRes?.data) setBooksList(Array.isArray(bRes.data) ? bRes.data : (bRes.data?.content || []));
    } catch {}

    try {
      const uRes = await axios.get("http://localhost:8080/api/users", { headers }).catch(() => null);
      if (uRes?.data) setUsersList(Array.isArray(uRes.data) ? uRes.data : []);
    } catch {}

    try {
      const sRes = await axios.get("http://localhost:8080/student/all", { headers }).catch(() => null);
      if (sRes?.data) setStudentsList(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []));
    } catch {}
  };

  const getBookDisplayName = (bookId) => {
    if (!bookId) return "-";
    const b = booksList.find(item => Number(item.bookid || item.book_id || item.id) === Number(bookId));
    return b ? (b.bookname || b.book_name) : `Book #${bookId}`;
  };

  const getUserDisplayName = (userId) => {
    if (!userId) return "-";
    const u = usersList.find(item => Number(item.user_id || item.id) === Number(userId));
    if (u && u.full_name) return u.full_name;
    const s = studentsList.find(item => Number(item.user_id) === Number(userId) || Number(item.student_id) === Number(userId));
    if (s && (s.student_name || s.studentName)) return s.student_name || s.studentName;
    return `User #${userId}`;
  };

  const fetchBookIssues = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const currentUserId = user?.user_id ?? user?.userId ?? user?.id ?? user?.student_id ?? null;

      let data = [];

      if (isPersonalView) {
        if (currentUserId !== null && currentUserId !== undefined && currentUserId !== "") {
          // Try user-specific endpoint first, fallback to all endpoint + client filter
          try {
            const res = await axios.get(`http://localhost:8080/api/book-issues/user/${currentUserId}`, { headers });
            data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
          } catch (e) {
            const res = await axios.get("http://localhost:8080/api/book-issues", { headers });
            const allData = Array.isArray(res.data) ? res.data : (res.data?.content || []);
            data = allData;
          }
        } else {
          data = [];
        }
      } else {
        // Librarian in master circulation view
        const res = await axios.get("http://localhost:8080/api/book-issues?all=true", { headers });
        data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      }

      // STRICT PERSONAL ISOLATION FILTER:
      // When isPersonalView is true, remove any record that does not match this user's ID
      if (isPersonalView && currentUserId !== null && currentUserId !== undefined) {
        data = data.filter((item) => {
          const itemUserId = item?.userId ?? item?.user_id ?? item?.user?.user_id ?? item?.user?.id;
          return Number(itemUserId) === Number(currentUserId);
        });
      }

      // Sort newest issued first
      data.sort((a, b) => Number(b.issueId || b.id || 0) - Number(a.issueId || a.id || 0));

      setBookIssueList(data);
    } catch (err) {
      console.error("Error fetching book issues:", err);
      setBookIssueList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookIssues();
    fetchContextData();
  }, [librarianShowAll]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddBookIssue) {
      alert("Only the Librarian (Role 5) is authorized to issue books.");
      return;
    }

    const selectedBook = booksList.find(b => Number(b.bookid || b.id) === Number(formData.bookId));
    if (selectedBook && Number(selectedBook.totalbook ?? selectedBook.total_book ?? 0) <= 0) {
      alert(`Cannot issue book: "${selectedBook.bookname || selectedBook.book_name}" is currently Out of Stock (0 copies available in Library).`);
      return;
    }

    const payload = {
      bookId: formData.bookId ? parseInt(formData.bookId) : null,
      userId: formData.userId ? parseInt(formData.userId) : null,
      issueDate: getTodayDate(),
      fine: formData.fine ? parseFloat(formData.fine) : 0.0,
      reason: formData.reason || ""
    };

    try {
      const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
      await axios.post('http://localhost:8080/api/book-issues', payload, { headers });

      alert("Book Issued Successfully! 1 copy deducted from library inventory.");
      setFormData({ bookId: '', userId: '', issueDate: getTodayDate(), fine: '', reason: '' });
      fetchBookIssues();
      fetchContextData();
    } catch (error) {
      console.error("Save error details:", error.response || error);
      alert("Error: " + (error.response?.data?.message || error.response?.data || "Failed to save data."));
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
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    tableHeaderBg: darkMode ? "#111827" : "#f1f5f9",
  };

  return (
    <div className={`book-issue-page ${darkMode ? "dark-mode" : ""}`} style={{
      minHeight: "100vh",
      width: "100vw",
      background: themeStyles.pageBg,
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "960px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Header */}
        <div className="book-issue-header" style={{
          background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Book Issue Module
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            {isPersonalView
              ? `My Issued Books Records (Showing data strictly for User ID: ${user?.user_id || "-"})`
              : "Master Circulation Desk (All College Records - Librarian View)"}
          </p>
        </div>

        {/* Add Form - Sirf Librarian (Role 5) ke liye visible rahega */}
        {canAddBookIssue && (
          <form onSubmit={handleSubmit} className="book-issue-form" style={{ padding: "32px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: themeStyles.textPrimary }}>Issue New Book</h3>
            <div className="book-issue-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>

              <div className="field-group">
                <label style={{ color: themeStyles.textSecondary }}>Select Book <span className="required">*</span></label>
                {booksList.length > 0 ? (
                  <div className="input-wrapper">
                    <FaBook className="input-icon" />
                    <select
                      name="bookId"
                      value={formData.bookId}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%", padding: "10px 12px 10px 40px", borderRadius: "10px",
                        border: `1.5px solid ${themeStyles.inputBorder}`, background: darkMode ? "#0f172a" : "#f8fafc",
                        color: themeStyles.textPrimary, outline: "none", cursor: "pointer", fontSize: "14px"
                      }}
                    >
                      <option value="" style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000" }}>-- Select Book --</option>
                      {booksList.map(b => {
                        const stock = Number(b.totalbook ?? b.total_book ?? 0);
                        const isOutOfStock = stock <= 0;
                        return (
                          <option
                            key={b.bookid || b.id}
                            value={b.bookid || b.id}
                            disabled={isOutOfStock}
                            style={{
                              background: darkMode ? "#1e293b" : "#ffffff",
                              color: isOutOfStock ? "#94a3b8" : (darkMode ? "#ffffff" : "#000")
                            }}
                          >
                            {b.bookname || b.book_name} ({b.authorname || 'Library'}) — {isOutOfStock ? "❌ Out of Stock (0)" : `📚 ${stock} Available`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div className="input-wrapper">
                    <FaBook className="input-icon" />
                    <input
                      type="number"
                      name="bookId"
                      placeholder="Enter Book ID"
                      value={formData.bookId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                {formData.bookId && (() => {
                  const b = booksList.find(item => Number(item.bookid || item.book_id || item.id) === Number(formData.bookId));
                  const stock = b ? Number(b.totalbook ?? b.total_book ?? 0) : 0;
                  return (
                    <span style={{ fontSize: "11px", color: stock > 0 ? "#10b981" : "#ef4444", fontWeight: "600", marginTop: "2px", display: "block" }}>
                      Selected: <strong>{getBookDisplayName(formData.bookId)}</strong> • Stock: <strong>{stock > 0 ? `${stock} Copies Available` : "Out of Stock (Cannot Issue)"}</strong>
                    </span>
                  );
                })()}
              </div>

              <div className="field-group">
                <label style={{ color: themeStyles.textSecondary }}>Issued To User <span className="required">*</span></label>
                {usersList.length > 0 ? (
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%", padding: "10px 12px 10px 40px", borderRadius: "10px",
                        border: `1.5px solid ${themeStyles.inputBorder}`, background: darkMode ? "#0f172a" : "#f8fafc",
                        color: themeStyles.textPrimary, outline: "none", cursor: "pointer", fontSize: "14px"
                      }}
                    >
                      <option value="" style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000" }}>-- Select User --</option>
                      {usersList.map(u => (
                        <option key={u.user_id || u.id} value={u.user_id || u.id} style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000" }}>
                          {u.full_name || u.emailId} ({u.emailId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      type="number"
                      name="userId"
                      placeholder="Enter User ID"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                {formData.userId && (
                  <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600", marginTop: "2px", display: "block" }}>
                    Selected: <strong>{getUserDisplayName(formData.userId)}</strong>
                  </span>
                )}
              </div>

              <div className="field-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ color: themeStyles.textSecondary }}>Issue Date <span className="required">*</span></label>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#d97706",
                    background: "rgba(217, 119, 6, 0.12)",
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}>
                    🔒 Today (Current)
                  </span>
                </div>
                <div className="input-wrapper">
                  <FaCalendarAlt className="input-icon" />
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate || getTodayDate()}
                    readOnly
                    tabIndex={-1}
                    style={{
                      cursor: "not-allowed",
                      opacity: 0.9,
                      background: darkMode ? "#0f172a" : "#f1f5f9"
                    }}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label style={{ color: themeStyles.textSecondary }}>Fine Amount</label>
                <div className="input-wrapper">
                  <FaMoneyBillWave className="input-icon" />
                  <input
                    type="number"
                    name="fine"
                    step="0.01"
                    placeholder="Enter Fine Amount (Optional)"
                    value={formData.fine}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="field-group full-width" style={{ gridColumn: "span 2" }}>
                <label style={{ color: themeStyles.textSecondary }}>Reason for Issue</label>
                <div className="input-wrapper textarea-wrapper">
                  <FaCommentDots className="input-icon textarea-icon" />
                  <textarea
                    name="reason"
                    placeholder="Enter purpose, academic reason, or semester book bank details..."
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>

            </div>

            <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="submit"
                className="btn-submit"
                style={{
                  background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                  color: "#ffffff",
                  padding: "12px 36px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(217, 119, 6, 0.35)",
                  fontSize: "14px"
                }}
              >
                <FaSave /> Issue Book
              </button>
            </div>
          </form>
        )}

        {/* Directory Table */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary }}>
                {isPersonalView ? "My Issued Books Records" : "All College Book Issue Directory"}
              </h3>
              {isPersonalView && user?.user_id && (
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "700", display: "block", marginTop: "4px" }}>
                  🎯 Showing records strictly for User ID: {user.user_id} ({user?.fullName || user?.full_name || user?.emailId || "You"})
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              {/* Librarian View Toggle Button */}
              {isLibrarian && (
                <button
                  type="button"
                  onClick={() => setLibrarianShowAll(!librarianShowAll)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "none",
                    background: librarianShowAll ? "#d97706" : "#2563eb",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  {librarianShowAll ? "👤 Show Only My Records" : "🌐 View All College Records"}
                </button>
              )}

              {/* User Filter (Visible only when Librarian toggles to show all records) */}
              {!isPersonalView && (
                <>
                  <select
                    value={selectedUserFilter}
                    onChange={(e) => setSelectedUserFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: `1px solid ${themeStyles.inputBorder}`,
                      background: darkMode ? "#0f172a" : "#f8fafc",
                      color: themeStyles.textPrimary,
                      fontSize: "13px",
                      outline: "none"
                    }}
                  >
                    <option value="All">All Users</option>
                    {usersList.map(u => (
                      <option key={u.user_id || u.id} value={u.user_id || u.id}>
                        {u.full_name || u.emailId}
                      </option>
                    ))}
                  </select>

                  {/* Search Bar */}
                  <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <FaSearch style={{
                      position: "absolute",
                      left: "12px",
                      color: "#94a3b8",
                      fontSize: "13px"
                    }} />
                    <input
                      type="text"
                      placeholder="Search User ID / Book ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        padding: "8px 12px 8px 32px",
                        borderRadius: "10px",
                        border: `1px solid ${themeStyles.inputBorder}`,
                        background: darkMode ? "#0f172a" : "#f8fafc",
                        color: themeStyles.textPrimary,
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: "10px 24px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaArrowLeft size={14} /> Back to Dashboard
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "14px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Book Title</th>
                  <th style={{ padding: "12px" }}>Issued To</th>
                  <th style={{ padding: "12px" }}>Issue Date</th>
                  <th style={{ padding: "12px" }}>Fine</th>
                  <th style={{ padding: "12px" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading book issue records...
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let displayedList = bookIssueList;

                    if (!isPersonalView && selectedUserFilter !== "All") {
                      displayedList = displayedList.filter(item => {
                        const uId = item.userId ?? item.user_id;
                        return Number(uId) === Number(selectedUserFilter);
                      });
                    }

                    if (!isPersonalView && searchTerm.trim()) {
                      const term = searchTerm.trim().toLowerCase();
                      displayedList = displayedList.filter(item => {
                        const bId = String(item.bookId || item.book_id || "");
                        const uId = String(item.userId || item.user_id || "");
                        const bName = getBookDisplayName(bId).toLowerCase();
                        const uName = getUserDisplayName(uId).toLowerCase();
                        return bId.includes(term) || uId.includes(term) || bName.includes(term) || uName.includes(term);
                      });
                    }

                    return displayedList.length > 0 ? (
                      displayedList.map((item, idx) => {
                        const bId = item.bookId || item.book_id;
                        const uId = item.userId || item.user_id;

                        return (
                          <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.inputBorder}` }}>
                            <td style={{ padding: "12px" }}>
                              <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{getBookDisplayName(bId)}</div>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{getUserDisplayName(uId)}</div>
                            </td>
                            <td style={{ padding: "12px" }}>{item.issueDate || item.issue_date || "-"}</td>
                            <td style={{ padding: "12px" }}>₹{item.fine ?? 0}</td>
                            <td style={{ padding: "12px" }}>{item.reason || "-"}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: "30px 20px", textAlign: "center", color: themeStyles.textSecondary }}>
                          {isPersonalView
                            ? `No book issue records found for your User ID (${user?.user_id || "-"}).`
                            : "No book issue records found."}
                        </td>
                      </tr>
                    );
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookIssue;