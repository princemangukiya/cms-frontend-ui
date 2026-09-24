import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding, FaUserGraduate, FaCalendarAlt,
  FaTasks, FaArrowLeft, FaSave, FaSearch, FaTimes,
  FaEdit, FaTrashAlt, FaCheck, FaSyncAlt, FaBriefcase,
  FaUserCheck, FaClock, FaTimesCircle
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const API_BASE_URL = "http://localhost:8080/api/placement";

const PlacementStudent = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // Role-Based Access Control (RBAC) Check:
  // Role 1 = HOD, Role 2 = Principal, Role 3 = Professor, Role 4 = Student
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  const canAddEdit = roleId === 6; // Only Placement Officer (Role 6) can add/edit
  const isStudent = roleId === 4;

  const [placementList, setPlacementList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    company_id: "",
    student_id: "",
    interview_date: "",
    status: ""
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const userMobile = (user?.mobile_no || user?.mobile || "").trim();
  const userName = (user?.full_name || user?.userName || user?.name || "").toLowerCase().trim();

  // Fetch all students to match current student's ID and provide name lookups
  const fetchStudentContext = async () => {
    try {
      const res = await axios.get("http://localhost:8080/student/all", {
        headers: getAuthHeaders()
      });
      const students = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setStudentsList(students);

      if (isStudent) {
        const myRecord = students.find(s =>
          (userEmail && s.email && s.email.toLowerCase().trim() === userEmail) ||
          (userMobile && s.mobile_no && s.mobile_no.trim() === userMobile) ||
          (user.user_id && s.user_id && Number(s.user_id) === Number(user.user_id)) ||
          (userName && s.student_name && s.student_name.toLowerCase().trim() === userName)
        );
        if (myRecord) {
          setCurrentStudent(myRecord);
        }
      }
    } catch (err) {
      console.warn("Could not fetch students context:", err);
    }
  };

  // Fetch companies to provide company name lookups
  const fetchCompaniesContext = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/placements", {
        headers: getAuthHeaders()
      });
      const companies = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCompaniesList(companies);
    } catch (err) {
      console.warn("Could not fetch companies context:", err);
    }
  };

  const getCompanyDisplayName = (cId) => {
    if (!cId) return "-";
    const c = companiesList.find(item => Number(item.companyId || item.company_id || item.id) === Number(cId));
    if (c) {
      return c.companyName || c.company_name || `Company #${cId}`;
    }
    return `Company #${cId}`;
  };

  const getStudentDisplayName = (sId) => {
    if (!sId) return "-";
    const s = studentsList.find(item => Number(item.student_id || item.id) === Number(sId));
    if (s) {
      return `${s.student_name || s.name || `Student #${sId}`}${s.roll_no ? ` (Roll: ${s.roll_no})` : ''}`;
    }
    return `Student #${sId}`;
  };

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get(API_BASE_URL, {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/placement/all", {
          headers: getAuthHeaders(),
        });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setPlacementList(data);
    } catch (err) {
      console.error("Error fetching placements:", err);
      showToast("Failed to fetch placement records from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
    fetchStudentContext();
    fetchCompaniesContext();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddEdit) {
      showToast("Unauthorized. Only Placement Officer can manage placements.", "error");
      return;
    }

    if (!formData.company_id || !formData.student_id || !formData.interview_date || !formData.status) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    setSubmitting(true);
    const payload = {
      company_id: Number(formData.company_id),
      student_id: Number(formData.student_id),
      interview_date: formData.interview_date,
      status: formData.status
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, payload, {
          headers: getAuthHeaders(),
        });
        showToast("Placement record updated successfully!", "success");
      } else {
        await axios.post(API_BASE_URL, payload, {
          headers: getAuthHeaders(),
        });
        showToast("Placement record saved successfully!", "success");
      }

      resetForm();
      fetchPlacements();
    } catch (error) {
      console.error("Error saving placement:", error);
      showToast("Error saving placement: " + (error.response?.data?.message || error.response?.data || error.message), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const id = item.placement_id || item.placementId || item.id;
    setEditingId(id);
    setFormData({
      company_id: item.company_id || item.companyId || "",
      student_id: item.student_id || item.studentId || "",
      interview_date: item.interview_date || item.interviewDate || "",
      status: item.status || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    const id = item.placement_id || item.placementId || item.id;
    if (!id) return;

    if (!window.confirm("Are you sure you want to delete this placement record?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      showToast("Placement record deleted successfully!", "success");
      if (editingId === id) resetForm();
      fetchPlacements();
    } catch (error) {
      console.error("Error deleting placement:", error);
      showToast("Failed to delete placement record.", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ company_id: "", student_id: "", interview_date: "", status: "" });
  };

  // Student specific filtering:
  // If role is Student (4), isolate and display ONLY their own records
  const studentFilteredList = useMemo(() => {
    if (!isStudent) return placementList;

    // Determine current student's ID
    const myStudentId = currentStudent?.student_id || currentStudent?.id;

    if (myStudentId) {
      return placementList.filter(item => {
        const itemStudentId = Number(item.student_id || item.studentId);
        return itemStudentId === Number(myStudentId);
      });
    }

    // If currentStudent not yet resolved by state, filter by any matching student record
    if (studentsList.length > 0) {
      const matchingStudent = studentsList.find(s =>
        (userEmail && s.email && s.email.toLowerCase().trim() === userEmail) ||
        (userMobile && s.mobile_no && s.mobile_no.trim() === userMobile) ||
        (user.user_id && s.user_id && Number(s.user_id) === Number(user.user_id)) ||
        (userName && s.student_name && s.student_name.toLowerCase().trim() === userName)
      );
      if (matchingStudent) {
        const targetId = Number(matchingStudent.student_id || matchingStudent.id);
        return placementList.filter(item => Number(item.student_id || item.studentId) === targetId);
      }
    }

    // Default to backend response (which is already isolated for Role 4)
    return placementList;
  }, [placementList, isStudent, currentStudent, userEmail, userMobile, userName, studentsList, user.user_id]);

  // Search filtered items
  const finalDisplayList = useMemo(() => {
    if (!searchTerm.trim()) return studentFilteredList;
    const term = searchTerm.toLowerCase().trim();
    return studentFilteredList.filter(item => {
      const studentIdStr = String(item.student_id || item.studentId || "");
      const companyIdStr = String(item.company_id || item.companyId || "");
      const statusStr = String(item.status || "").toLowerCase();
      const dateStr = String(item.interview_date || item.interviewDate || "");

      // Match against student name if available
      const studentObj = studentsList.find(s => Number(s.student_id) === Number(item.student_id || item.studentId));
      const studentName = (studentObj?.student_name || "").toLowerCase();

      // Match against company name if available
      const companyObj = companiesList.find(c => Number(c.companyId || c.company_id) === Number(item.company_id || item.companyId));
      const companyName = (companyObj?.companyName || companyObj?.company_name || "").toLowerCase();

      return studentIdStr.includes(term) || companyIdStr.includes(term) || statusStr.includes(term) || dateStr.includes(term) || studentName.includes(term) || companyName.includes(term);
    });
  }, [studentFilteredList, searchTerm, studentsList, companiesList]);

  // Metrics
  const totalCount = studentFilteredList.length;
  const selectedCount = studentFilteredList.filter(p => String(p.status).toLowerCase() === "selected").length;
  const pendingCount = studentFilteredList.filter(p => String(p.status).toLowerCase() === "pending").length;

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
    tableHeaderBg: darkMode ? "#111827" : "#f1f5f9",
    tableRowHover: darkMode ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
    iconColor: "#d97706"
  };

  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "Selected", label: "Selected" },
    { value: "Pending", label: "Pending" },
    { value: "Rejected", label: "Rejected" }
  ];

  const getStatusBadge = (status) => {
    let bg = "#e2e8f0";
    let text = "#475569";
    const st = String(status || "").toLowerCase();
    if (st === "selected") { bg = "#dcfce7"; text = "#15803d"; }
    else if (st === "pending") { bg = "#fef9c3"; text = "#a16207"; }
    else if (st === "rejected") { bg = "#fee2e2"; text = "#b91c1c"; }

    return (
      <span style={{
        backgroundColor: bg,
        color: text,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "800",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px"
      }}>
        {st === "selected" && "✓ "}
        {st === "pending" && "⏳ "}
        {st === "rejected" && "✕ "}
        {status || "N/A"}
      </span>
    );
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, options = null) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

          {options ? (
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required={required}
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
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {options.map((opt, idx) => (
                <option key={idx} value={opt.value} style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000000" }}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
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
          )}
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

      {/* Toast Notification Popup */}
      {toast.show && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 10000,
          background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#ffffff",
          padding: "14px 22px", borderRadius: "12px", boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", fontSize: "14px"
        }}>
          {toast.type === "error" ? <FaTimes /> : <FaCheck />}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{
        width: "100%",
        maxWidth: "1000px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Banner Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
          padding: "32px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "10px",
                borderRadius: "12px",
                display: "flex"
              }}>
                <FaBriefcase size={24} />
              </div>
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Placement Module
              </h2>
            </div>
            <p style={{ margin: "6px 0 0 0", opacity: 0.95, fontSize: "14px", fontWeight: "500" }}>
              {canAddEdit
                ? "💼 Placement Officer Control Mode - Add & Manage Student Placements"
                : (isStudent
                  ? "🎓 Student Confidential Portal - Viewing My Personal & Secret Placement Status"
                  : (roleId === 1 ? "👔 HOD View Mode - View Placement Directory (Read Only)"
                     : roleId === 2 ? "👑 Principal View Mode - View Placement Directory (Read Only)"
                     : "👨‍🏫 Professor View Mode - View Placement Directory (Read Only)"))}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "#ffffff",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s ease"
            }}
          >
            <FaArrowLeft size={13} /> Dashboard
          </button>
        </div>

        {/* 📊 Metrics Summary Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          padding: "24px 32px 0 32px"
        }}>
          <div style={{
            background: themeStyles.inputBg,
            padding: "16px 20px",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.inputBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}>
            <div style={{ background: "rgba(217, 119, 6, 0.12)", color: "#d97706", padding: "12px", borderRadius: "12px" }}>
              <FaBriefcase size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>
                {isStudent ? "My Interviews" : "Total Placements"}
              </span>
              <div style={{ fontSize: "20px", fontWeight: "900", color: themeStyles.textPrimary }}>{totalCount} Records</div>
            </div>
          </div>

          <div style={{
            background: themeStyles.inputBg,
            padding: "16px 20px",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.inputBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}>
            <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "12px", borderRadius: "12px" }}>
              <FaUserCheck size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Selected</span>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#10b981" }}>{selectedCount} Selected</div>
            </div>
          </div>

          <div style={{
            background: themeStyles.inputBg,
            padding: "16px 20px",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.inputBorder}`,
            display: "flex",
            alignItems: "center",
            gap: "14px"
          }}>
            <div style={{ background: "rgba(234, 179, 8, 0.12)", color: "#eab308", padding: "12px", borderRadius: "12px" }}>
              <FaClock size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Pending</span>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#eab308" }}>{pendingCount} Pending</div>
            </div>
          </div>
        </div>

        {/* Form Section - Visible ONLY to Principal (2) & HOD (1) */}
        {canAddEdit ? (
          <form onSubmit={handleSubmit} style={{ padding: "32px", borderBottom: `1px solid ${themeStyles.cardBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "800" }}>
                {editingId ? "✏️ Edit Placement Record" : "➕ Add Placement Record"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Company (ID & Name) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <div style={{
                    position: "absolute", left: "14px", color: themeStyles.iconColor,
                    display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10
                  }}>
                    <FaBuilding size={16} />
                  </div>
                  {companiesList.length > 0 ? (
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500",
                        outline: "none", boxSizing: "border-box", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Company --</option>
                      {companiesList.map((c) => {
                        const cid = c.companyId || c.company_id || c.id;
                        const cname = c.companyName || c.company_name || `Company #${cid}`;
                        return (
                          <option key={cid} value={cid} style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000000" }}>
                            {cname}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      required
                      style={{
                        width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  )}
                </div>
                {formData.company_id && (
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#d97706" }}>
                    Selected: {getCompanyDisplayName(formData.company_id)}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Student Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <div style={{
                    position: "absolute", left: "14px", color: themeStyles.iconColor,
                    display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10
                  }}>
                    <FaUserGraduate size={16} />
                  </div>
                  {studentsList.length > 0 ? (
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500",
                        outline: "none", boxSizing: "border-box", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Student --</option>
                      {studentsList.map((s) => {
                        const sid = s.student_id || s.id;
                        const sname = s.student_name || s.name || `Student #${sid}`;
                        const sroll = s.roll_no ? ` (Roll: ${s.roll_no})` : "";
                        return (
                          <option key={sid} value={sid} style={{ background: darkMode ? "#1e293b" : "#ffffff", color: darkMode ? "#ffffff" : "#000000" }}>
                            {sname}{sroll}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="e.g. 31 or 22"
                      required
                      style={{
                        width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  )}
                </div>
                {formData.student_id && (
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1" }}>
                    Selected: {getStudentDisplayName(formData.student_id)}
                  </div>
                )}
              </div>

              {renderInputField("Interview Date", "interview_date", "", FaCalendarAlt, "date", true)}
              {renderInputField("Status", "status", "", FaTasks, "select", true, statusOptions)}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 36px",
                  background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
                  transition: "all 0.2s ease",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                <FaSave size={14} /> {submitting ? "Saving..." : (editingId ? "Update Details" : "Save Details")}
              </button>
            </div>
          </form>
        ) : isStudent ? (
          <div style={{
            margin: "24px 32px 0 32px",
            padding: "16px 20px",
            background: "rgba(217, 119, 6, 0.08)",
            borderRadius: "14px",
            border: "1px solid rgba(217, 119, 6, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            color: themeStyles.textPrimary
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <FaUserGraduate color="#d97706" size={20} />
              <div>
                <span style={{ fontSize: "14px", fontWeight: "800", display: "block" }}>
                  {currentStudent?.student_name ? `${currentStudent.student_name} (${userEmail})` : userEmail}
                </span>
                <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                  {currentStudent?.student_id ? `Registered Student ID: #${currentStudent.student_id} | Roll No: ${currentStudent.roll_no || '-'}` : "Student Profile Active"}
                </span>
              </div>
            </div>
            <span style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              🔒 Verified Private View
            </span>
          </div>
        ) : null}

        {/* Placement Directory List Table Section */}
        <div style={{ padding: "32px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px"
          }}>
            <div>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "800" }}>
                {isStudent ? "My Placement Records" : "Placement Directory List"}
              </h3>
              <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                Showing {finalDisplayList.length} of {totalCount} records
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Search Bar */}
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                background: themeStyles.inputBg,
                border: `1.5px solid ${themeStyles.inputBorder}`,
                borderRadius: "12px",
                padding: "8px 14px",
                minWidth: "240px"
              }}>
                <FaSearch size={14} color={themeStyles.iconColor} style={{ marginRight: "10px" }} />
                <input
                  type="text"
                  placeholder="Search by company, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: themeStyles.textPrimary,
                    fontSize: "13px",
                    width: "100%",
                    fontWeight: "500"
                  }}
                />
                {searchTerm && (
                  <FaTimes
                    size={12}
                    color={themeStyles.textSecondary}
                    style={{ cursor: "pointer", marginLeft: "6px" }}
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => { fetchPlacements(); fetchStudentContext(); }}
                title="Refresh Placement List"
                style={{
                  padding: "10px 14px",
                  background: themeStyles.inputBg,
                  border: `1.5px solid ${themeStyles.inputBorder}`,
                  borderRadius: "12px",
                  color: themeStyles.textPrimary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                <FaSyncAlt size={12} /> Refresh
              </button>
            </div>
          </div>

          <div style={{
            overflowX: "auto",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.cardBorder}`,
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "14px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left" }}>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Company (ID / Name)</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Student (ID / Name)</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Interview Date</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Status</th>
                  {canAddEdit && (
                    <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary, textAlign: "right" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canAddEdit ? 5 : 4} style={{ padding: "30px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading placement records...
                    </td>
                  </tr>
                ) : finalDisplayList.length > 0 ? (
                  finalDisplayList.map((item, idx) => {
                    const id = item.placement_id || item.placementId || item.id || idx;
                    const companyId = item.company_id || item.companyId || "-";
                    const studentId = item.student_id || item.studentId || "-";
                    const interviewDate = item.interview_date || item.interviewDate || "-";

                    // Name lookups if available
                    const studentObj = studentsList.find(s => Number(s.student_id) === Number(studentId));
                    const companyObj = companiesList.find(c => Number(c.companyId || c.company_id) === Number(companyId));

                    return (
                      <tr
                        key={id}
                        style={{
                          borderBottom: `1px solid ${themeStyles.cardBorder}`,
                          transition: "background 0.15s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = themeStyles.tableRowHover}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaBuilding color="#d97706" size={13} />
                            {companyObj ? (companyObj.companyName || companyObj.company_name) : getCompanyDisplayName(companyId)}
                          </div>
                          {companyId !== "-" && (
                            <span style={{
                              display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "700",
                              background: "rgba(217, 119, 6, 0.12)", color: "#d97706",
                              padding: "2px 8px", borderRadius: "6px"
                            }}>
                              ID #{companyId}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaUserGraduate color="#6366f1" size={13} />
                            {studentObj ? (studentObj.student_name || studentObj.name) : getStudentDisplayName(studentId)}
                          </div>
                          {studentId !== "-" && (
                            <span style={{
                              display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "700",
                              background: "rgba(99, 102, 241, 0.12)", color: "#6366f1",
                              padding: "2px 8px", borderRadius: "6px"
                            }}>
                              Student ID #{studentId} {studentObj?.roll_no ? `• Roll: ${studentObj.roll_no}` : ""}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", color: themeStyles.textSecondary, fontWeight: "600" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FaCalendarAlt size={12} /> {interviewDate}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>{getStatusBadge(item.status)}</td>
                        {canAddEdit && (
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                title="Edit Record"
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
                                title="Delete Record"
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={canAddEdit ? 5 : 4} style={{ padding: "30px", textAlign: "center", color: themeStyles.textSecondary }}>
                      {searchTerm
                        ? "No placement records match your search query."
                        : (isStudent ? "No placement interview records found for your account yet." : "No placement records found.")}
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

export default PlacementStudent;