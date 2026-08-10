import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaUserEdit, FaLanguage,
  FaBoxes, FaTag, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Library = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [formData, setFormData] = useState({
    bookname: "",
    authorname: "",
    booklanguage: "",
    totalbook: "",
    bookprice: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/library",
        {
          bookname: formData.bookname,
          authorname: formData.authorname,
          booklanguage: formData.booklanguage,
          totalbook: Number(formData.totalbook),
          bookprice: Number(formData.bookprice)
        }
      );

      console.log(response.data);
      alert("Book Details Saved Successfully!");

      setFormData({
        bookname: "",
        authorname: "",
        booklanguage: "",
        totalbook: "",
        bookprice: ""
      });

    } catch (error) {
      console.error("Error :", error);

      if (error.response) {
        console.error(error.response.data);
        alert("Backend Error : " + error.response.data);
      } else {
        alert("Error : " + error.message);
      }
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
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    iconColor: "#2563eb"
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, isFullWidth = false) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: isFullWidth ? "span 2" : "span 1" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
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
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "650px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`
      }}>
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Library Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Add New Book Details
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {renderInputField("Book Name", "bookname", "Enter Book Name", FaBook, "text", true)}
            {renderInputField("Author Name", "authorname", "Enter Author Name", FaUserEdit, "text", true)}
            {renderInputField("Language", "booklanguage", "Enter Book Language", FaLanguage, "text", true)}
            {renderInputField("Total Books", "totalbook", "Enter Quantity", FaBoxes, "number", true)}
            {renderInputField("Book Price", "bookprice", "Enter Price per Book", FaTag, "number", true, true)}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "32px",
            justifyContent: "flex-end",
            alignItems: "center"
          }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: "12px 28px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#475569",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#ef4444";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
            >
              <FaArrowLeft size={14} /> Back
            </button>

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
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(37, 99, 235, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(37, 99, 235, 0.35)";
              }}
            >
              <FaSave size={14} /> Save Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Library;