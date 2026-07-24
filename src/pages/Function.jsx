import React from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';

function FunctionPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", fontFamily: "'Inter', sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>
      <button
        onClick={() => navigate("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "#0f172a", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontWeight: "600" }}
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>College Functions & Events</h1>

      {/* यहाँ आप बाद में अपनी फोटो लगा सकते हैं */}
      <div style={{ background: "#ffffff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <img
          src="/bg-staff.jpg"
          alt="Function"
          style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "12px", marginBottom: "20px" }}
        />
        <h3 style={{ color: "#334155" }}>Annual Functions & Celebrations</h3>
        <p style={{ color: "#64748b" }}>Yaha aap college functions ki photos aur details add kar sakte hain.</p>
      </div>
    </div>
  );
}

export default FunctionPage;