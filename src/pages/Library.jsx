import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaUserEdit, FaLanguage,
  FaBoxes, FaTag, FaArrowLeft, FaSave, FaSearch
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Library = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // RBAC Access Control: ONLY Librarian (Role 5) can Add Books; Principal, HOD, Professor, and Students View Only
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const isLibrarian = roleId === 5;

  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    bookname: "",
    authorname: "",
    booklanguage: "",
    totalbook: "",
    bookprice: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/library/all", {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/library", {
          headers: getAuthHeaders(),
        });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setBookList(data);
    } catch (err) {
      console.error("Error fetching library books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLibrarian) {
      alert("Only the Librarian (Role 5) is authorized to add new books.");
      return;
    }

    const payload = {
      bookname: formData.bookname,
      authorname: formData.authorname,
      booklanguage: formData.booklanguage,
      totalbook: Number(formData.totalbook),
      bookprice: Number(formData.bookprice)
    };

    try {
      try {
        await axios.post("http://localhost:8080/library/add", payload, {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        await axios.post("http://localhost:8080/api/library", payload, {
          headers: getAuthHeaders(),
        });
      }

      alert("Book Details Saved Successfully!");
      setFormData({
        bookname: "",
        authorname: "",
        booklanguage: "",
        totalbook: "",
        bookprice: ""
      });
      fetchBooks();

    } catch (error) {
      console.error("Error :", error);
      alert("Error saving book: " + (error.response?.data?.message || error.response?.data || error.message));
    }
  };

  const filteredBooks = bookList.filter(item => {
    const term = searchTerm.toLowerCase();
    const name = (item.bookname || item.book_name || "").toLowerCase();
    const author = (item.authorname || item.author_name || "").toLowerCase();
    const lang = (item.booklanguage || item.book_language || "").toLowerCase();
    return name.includes(term) || author.includes(term) || lang.includes(term);
  });

  const themeStyles = {
    pageBg: darkMode ? "#0f172a" : "#f8fafc",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 10px 30px rgba(0, 0, 0, 0.05)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    iconColor: darkMode ? "#94a3b8" : "#64748b",
    tableHeaderBg: darkMode ? "#0f172a" : "#f1f5f9",
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute",
            left: "14px",
            color: themeStyles.iconColor,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>

          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              borderRadius: "12px",
              border: `2px solid ${themeStyles.inputBorder}`,
              background: themeStyles.inputBg,
              color: themeStyles.textPrimary,
              fontSize: "14px",
              fontWeight: "500",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.2s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.2)";
              e.target.style.background = darkMode ? "#1e293b" : "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = themeStyles.inputBorder;
              e.target.style.boxShadow = "none";
              e.target.style.background = themeStyles.inputBg;
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{
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
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Library Management Module
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            {isLibrarian ? "Manage & Add Book Details (Librarian Role)" : "College Library Catalog (View Only)"}
          </p>
        </div>

        {/* Form Section - Visible ONLY for Librarian (Role 5) */}
        {isLibrarian && (
          <form onSubmit={handleSubmit} style={{ padding: "32px", borderBottom: `1px solid ${themeStyles.cardBorder}` }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", color: themeStyles.textPrimary }}>Add New Book</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {renderInputField("Book Name", "bookname", "Enter Book Name", FaBook, "text", true)}
              {renderInputField("Author Name", "authorname", "Enter Author Name", FaUserEdit, "text", true)}
              {renderInputField("Language", "booklanguage", "Enter Book Language", FaLanguage, "text", true)}
              {renderInputField("Total Books", "totalbook", "Enter Quantity", FaBoxes, "number", true)}
              {renderInputField("Book Price", "bookprice", "Enter Price per Book", FaTag, "number", true)}
            </div>

            {/* Save Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 36px",
                  background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                <FaSave size={14} /> Save Book
              </button>
            </div>
          </form>
        )}

        {/* Library Directory Table Section */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary }}>Library Directory List</h3>
              {!isLibrarian && (
                <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600" }}>
                  View Only Mode • Total {bookList.length} Books in Library
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <FaSearch style={{ position: "absolute", left: "12px", color: "#94a3b8", fontSize: "13px" }} />
                <input
                  type="text"
                  placeholder="Search book or author..."
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
                  <th style={{ padding: "12px" }}>Book Name</th>
                  <th style={{ padding: "12px" }}>Author Name</th>
                  <th style={{ padding: "12px" }}>Language</th>
                  <th style={{ padding: "12px" }}>Quantity</th>
                  <th style={{ padding: "12px" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading library directory...
                    </td>
                  </tr>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.inputBorder}` }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                          {item.bookname || item.book_name || "-"}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>{item.authorname || item.author_name || "-"}</td>
                      <td style={{ padding: "12px" }}>{item.booklanguage || item.book_language || "-"}</td>
                      <td style={{ padding: "12px" }}>{item.totalbook || item.total_book || 0}</td>
                      <td style={{ padding: "12px", fontWeight: "700", color: "#2563eb" }}>
                        ₹{item.bookprice || item.book_price || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>
                      No book records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Library;