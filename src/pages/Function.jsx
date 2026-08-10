import React from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaImage } from 'react-icons/fa';
import { useTheme } from "../context/ThemeContext";

function FunctionPage() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const themeStyles = {
    pageBg: darkMode
      ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
      : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.5)" : "0 15px 35px rgba(0, 0, 0, 0.08)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
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
        maxWidth: "800px",
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
            College Functions & Events
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            Explore Annual Celebrations and Event Highlights
          </p>
        </div>

        {/* Content Section */}
        <div style={{ padding: "32px" }}>
          <div style={{
            background: darkMode ? "#0f172a" : "#f8fafc",
            padding: "24px",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.cardBorder}`,
            textAlign: "center"
          }}>
            <div style={{
              overflow: "hidden",
              borderRadius: "12px",
              marginBottom: "20px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
            }}>
              <img
                src="/bg-staff.jpg"
                alt="Function"
                style={{
                  width: "100%",
                  maxHeight: "350px",
                  objectFit: "cover",
                  display: "block"
                }}
              />
            </div>

            <h3 style={{
              color: themeStyles.textPrimary,
              margin: "0 0 8px 0",
              fontSize: "20px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}>
              <FaCalendarAlt style={{ color: "#2563eb" }} /> Annual Functions & Celebrations
            </h3>

            <p style={{
              color: themeStyles.textSecondary,
              margin: 0,
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Yaha aap college functions ki photos aur details add kar sakte hain.
            </p>
          </div>

          {/* Action Button */}
          <div style={{
            display: "flex",
            marginTop: "32px",
            justifyContent: "flex-start",
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
              <FaArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FunctionPage;