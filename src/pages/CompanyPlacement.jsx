import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaBuilding, FaBriefcase,
  FaMapMarkerAlt, FaMoneyBillWave, FaGlobe, FaSave,
  FaEdit, FaTrashAlt, FaTimes
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function CompanyPlacement() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // RBAC Access Control: Placement Officer (Role 6) exclusive management
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const canAddEdit = roleId === 6; // Only Placement Officer can add/manage

  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State for Adding/Editing a Company Placement
  const [newPlacement, setNewPlacement] = useState({
    companyName: "",
    jobRole: "",
    location: "",
    packageLpa: "",
    website: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Backend se data fetch karne ke liye
  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/placements", {
        headers: getAuthHeaders()
      });
      setPlacements(Array.isArray(response.data) ? response.data : (response.data?.content || []));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching placement records:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewPlacement({ ...newPlacement, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    const id = item.companyId || item.company_id || item.id;
    setEditingId(id);
    setNewPlacement({
      companyName: item.companyName || item.company_name || "",
      jobRole: item.jobRole || item.job_role || "",
      location: item.location || "",
      packageLpa: item.packageLpa || item.package_lpa || "",
      website: item.website || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    const id = item.companyId || item.company_id || item.id;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete ${item.companyName || item.company_name || "this company"}?`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/placements/${id}`, {
        headers: getAuthHeaders()
      });
      alert("Company Deleted Successfully!");
      if (editingId === id) {
        handleCancelEdit();
      }
      fetchPlacements();
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewPlacement({
      companyName: "",
      jobRole: "",
      location: "",
      packageLpa: "",
      website: ""
    });
  };

  const handleSavePlacement = async (e) => {
    e.preventDefault();
    if (!canAddEdit) {
      alert("You do not have permission to manage company placements.");
      return;
    }

    try {
      const payload = {
        ...newPlacement,
        packageLpa: newPlacement.packageLpa ? parseFloat(newPlacement.packageLpa) : null
      };

      if (editingId) {
        await axios.put(`http://localhost:8080/api/placements/${editingId}`, payload, {
          headers: getAuthHeaders()
        });
        alert("Company Placement Updated Successfully!");
      } else {
        await axios.post("http://localhost:8080/api/placements", payload, {
          headers: getAuthHeaders()
        });
        alert("Company Placement Added Successfully!");
      }

      handleCancelEdit();
      fetchPlacements(); // Refresh list
    } catch (error) {
      console.error("Error saving placement:", error);
      if (error.response?.status === 403) {
        alert("403 Forbidden: Unauthorized access! Only Placement Officer can add or edit companies.");
      } else {
        alert("Failed to save company placement.");
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
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    headerBg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    tableHeaderBg: darkMode ? "#334155" : "#f1f5f9",
    tableBorder: darkMode ? "#334155" : "#e2e8f0",
    iconColor: "#f97316"
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
            value={newPlacement[name]}
            onChange={handleInputChange}
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
      alignItems: "flex-start",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "40px"
      }}>
        {/* Header Section */}
        <div style={{
          background: themeStyles.headerBg,
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Company Placement Module
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            {canAddEdit ? "💼 Placement Officer Mode - Add & Manage Recruitment Directory" : "View Company Recruitment Directory (Read Only)"}
          </p>
        </div>

        {/* Add/Edit Form Section (Only visible for Placement Officer) */}
        {canAddEdit && (
          <div style={{ padding: "32px", borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "700" }}>
                {editingId ? "✏️ Edit Company Placement" : "➕ Add Company Placement"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={handleSavePlacement}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {renderInputField("Company Name", "companyName", "Enter company name", FaBuilding, "text", true)}
                {renderInputField("Job Role", "jobRole", "Enter job role", FaBriefcase, "text", true)}
                {renderInputField("Location", "location", "Enter location", FaMapMarkerAlt, "text", true)}
                {renderInputField("Package (LPA)", "packageLpa", "e.g. 6.5", FaMoneyBillWave, "number", true)}
                {renderInputField("Website URL", "website", "https://example.com", FaGlobe, "text", true, true)}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "12px 32px",
                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 8px 20px rgba(249, 115, 22, 0.35)"
                  }}
                >
                  <FaSave size={14} /> {editingId ? "Update Placement" : "Save Placement"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content Section / List Table */}
        <div style={{ padding: "32px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: themeStyles.textPrimary, fontWeight: "700" }}>
              Company Directory List
            </h3>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "10px 20px",
                background: darkMode ? "#334155" : "#f1f5f9",
                border: `1px solid ${themeStyles.tableBorder}`,
                color: themeStyles.textPrimary,
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <FaArrowLeft size={12} /> Back to Dashboard
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
              color: themeStyles.textPrimary
            }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg }}>
                  <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}` }}>Company (ID / Name)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}` }}>Job Role</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}` }}>Location</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}` }}>Package (LPA)</th>
                  <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}` }}>Website</th>
                  {canAddEdit && (
                    <th style={{ padding: "12px 16px", fontWeight: "700", borderBottom: `2px solid ${themeStyles.tableBorder}`, textAlign: "right" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canAddEdit ? 6 : 5} style={{ textAlign: "center", padding: "30px", color: themeStyles.textSecondary }}>
                      Loading records...
                    </td>
                  </tr>
                ) : placements.length === 0 ? (
                  <tr>
                    <td colSpan={canAddEdit ? 6 : 5} style={{ textAlign: "center", padding: "30px", color: themeStyles.textSecondary }}>
                      No placement records found.
                    </td>
                  </tr>
                ) : (
                  placements.map((item, index) => (
                    <tr key={index} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                          {item.companyName || item.company_name}
                        </div>
                        {(item.companyId || item.company_id || item.id) && (
                          <span style={{
                            display: "inline-block", marginTop: "2px", fontSize: "11px", fontWeight: "700",
                            background: "rgba(217, 119, 6, 0.12)", color: "#d97706",
                            padding: "2px 6px", borderRadius: "4px"
                          }}>
                            Company ID #{item.companyId || item.company_id || item.id}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{item.jobRole || item.job_role}</td>
                      <td style={{ padding: "12px 16px" }}>{item.location}</td>
                      <td style={{ padding: "12px 16px", color: "#10b981", fontWeight: "700" }}>{item.packageLpa || item.package_lpa} LPA</td>
                      <td style={{ padding: "12px 16px" }}>
                        <a href={item.website} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "none" }}>
                          {item.website}
                        </a>
                      </td>
                      {canAddEdit && (
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              title="Edit Company"
                              style={{
                                padding: "6px 10px",
                                background: themeStyles.inputBg,
                                border: `1px solid ${themeStyles.inputBorder}`,
                                color: themeStyles.textSecondary,
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              title="Delete Company"
                              style={{
                                padding: "6px 10px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#ef4444",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyPlacement;