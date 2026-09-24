import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaChalkboardTeacher, FaGraduationCap, FaBuilding,
  FaLayerGroup, FaDoorClosed, FaArrowLeft, FaSave,
  FaSearch, FaTimes, FaEdit, FaTrashAlt, FaCheck,
  FaUniversity, FaEye, FaSyncAlt, FaFilter
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const API_BASE_URL = "http://localhost:8080/api/class-management";

const ClassMgmt = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // RBAC Control:
  // Role 1 = HOD, Role 2 = Principal, Role 3 = Professor, Role 4 = Student
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  const isPrincipal = roleId === 2;
  const isHOD = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;

  // Principal (2) & HOD (1) can add/edit classes. Professor (3) and Student (4) are strictly View-Only!
  const canAddEdit = isPrincipal || isHOD;

  const [classList, setClassList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [enrolledCourseId, setEnrolledCourseId] = useState(null);
  const [assignedCourseIds, setAssignedCourseIds] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [classData, setClassData] = useState({
    class_name: '', course_id: '', building_no: '', floor_no: '', room_no: ''
  });

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Helper to safely extract all assigned course IDs from staff object (supports single course_id & comma-separated course_ids)
  const extractStaffCourseIds = (staff) => {
    if (!staff) return [];
    const set = new Set();
    const cId = Number(staff.course_id || staff.courseId);
    if (cId) set.add(cId);
    const rawList = staff.course_ids || staff.courseIds;
    if (rawList) {
      String(rawList).split(',').forEach(idStr => {
        const parsed = Number(idStr.trim());
        if (parsed) set.add(parsed);
      });
    }
    return Array.from(set);
  };

  const fetchStudentProfile = async () => {
    if (roleId !== 4) return;
    try {
      const res = await axios.get("http://localhost:8080/student/all", { headers: getAuthHeaders() });
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const currentEmail = user?.emailId || user?.email || "";
      const currentUserId = user?.user_id || user?.userId || null;

      const matchedStudent = list.find(s => 
        (currentEmail && s.email?.toLowerCase() === currentEmail.toLowerCase()) ||
        (currentUserId && Number(s.user_id || s.userId) === Number(currentUserId))
      ) || list[0];

      if (matchedStudent) {
        setStudentProfile(matchedStudent);
        const cId = Number(matchedStudent.course_id || matchedStudent.courseId);
        if (cId) {
          setEnrolledCourseId(cId);
        }
      }
    } catch (err) {
      console.warn("Could not fetch student profile in ClassMgmt:", err);
    }
  };

  // Fetch Staff Profile for both Professor (Role 3) & HOD (Role 1) to resolve all assigned department courses
  const fetchStaffProfile = async () => {
    if (roleId !== 3 && roleId !== 1) return;
    try {
      const res = await axios.get("http://localhost:8080/staff/all", { headers: getAuthHeaders() });
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const currentEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
      const currentUserId = user?.user_id || user?.userId || null;
      const currentMobile = (user?.mobile_no || user?.mobileno || user?.mobile || "").trim();

      const matchedStaff = list.find(st => 
        (currentEmail && st.email?.toLowerCase().trim() === currentEmail) ||
        (currentUserId && Number(st.user_id || st.userId) === Number(currentUserId)) ||
        (currentMobile && String(st.mobileno || st.mobile || "").trim() === currentMobile)
      );

      if (matchedStaff) {
        const ids = extractStaffCourseIds(matchedStaff);
        setAssignedCourseIds(ids);
      }
    } catch (err) {
      console.warn("Could not fetch staff profile in ClassMgmt:", err);
    }
  };

  const fetchCoursesContext = async () => {
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/api/courses/all", { headers: getAuthHeaders() });
      } catch {
        res = await axios.get("http://localhost:8080/api/courses", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCoursesList(data);
    } catch (err) {
      console.warn("Could not fetch courses context:", err);
    }
  };

  const getCourseDisplayName = (cId) => {
    if (!cId || cId === "-") return "-";
    const c = coursesList.find(item => Number(item.course_id || item.id) === Number(cId));
    if (c && (c.course_name || c.courseName)) {
      return c.course_name || c.courseName;
    }
    return `Course #${cId}`;
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, {
        headers: getAuthHeaders(),
      });
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setClassList(data);
    } catch (err) {
      console.error("Error fetching class list:", err);
      // Fallback try with trailing slash if needed
      try {
        const fallbackRes = await axios.get(`${API_BASE_URL}/all`, {
          headers: getAuthHeaders(),
        });
        const fallbackData = Array.isArray(fallbackRes.data) ? fallbackRes.data : (fallbackRes.data?.content || []);
        setClassList(fallbackData);
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
        showToast("Failed to fetch classes from server.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchCoursesContext();
    if (roleId === 4) {
      fetchStudentProfile();
    }
    if (roleId === 3 || roleId === 1) {
      fetchStaffProfile();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canAddEdit) {
      showToast("Unauthorized. Only faculty and administrators can manage classes.", "error");
      return;
    }

    if (!classData.class_name || classData.class_name.trim() === '') {
      showToast("Class Name is required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let targetCourseId = classData.course_id ? Number(classData.course_id) : null;
      if (!targetCourseId && isHOD && assignedCourseIds.length === 1) {
        targetCourseId = assignedCourseIds[0];
      }

      const payload = {
        class_name: classData.class_name.trim(),
        course_id: targetCourseId,
        building_no: classData.building_no?.trim() || '',
        floor_no: classData.floor_no?.trim() || '',
        room_no: classData.room_no?.trim() || ''
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, payload, {
          headers: getAuthHeaders(),
        });
        showToast("Class updated successfully!", "success");
      } else {
        await axios.post(API_BASE_URL, payload, {
          headers: getAuthHeaders(),
        });
        showToast("Class saved successfully!", "success");
      }

      resetForm();
      fetchClasses();
    } catch (error) {
      console.error("Error saving class:", error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message || "Failed to save class.";
      showToast("Error: " + errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const id = item.class_id || item.classId || item.id;
    setEditingId(id);
    setClassData({
      class_name: item.class_name || item.className || '',
      course_id: item.course_id || item.courseId || '',
      building_no: item.building_no || item.buildingNo || '',
      floor_no: item.floor_no || item.floorNo || '',
      room_no: item.room_no || item.roomNo || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item) => {
    const id = item.class_id || item.classId || item.id;
    const name = item.class_name || item.className || 'this class';
    if (!id) return;

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
      showToast("Class deleted successfully!", "success");
      if (editingId === id) resetForm();
      fetchClasses();
    } catch (error) {
      console.error("Error deleting class:", error);
      showToast("Failed to delete class.", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setClassData({
      class_name: '',
      course_id: isHOD && assignedCourseIds.length === 1 ? String(assignedCourseIds[0]) : '',
      building_no: '',
      floor_no: '',
      room_no: ''
    });
  };

  // Effective enrolled course resolution for Student Role 4
  const effectiveEnrolledCourseId = useMemo(() => {
    if (roleId !== 4) return null;
    if (enrolledCourseId) return Number(enrolledCourseId);
    if (studentProfile?.course_id || studentProfile?.courseId) return Number(studentProfile.course_id || studentProfile.courseId);
    if (coursesList.length === 1) return Number(coursesList[0].course_id || coursesList[0].id);
    return null;
  }, [roleId, enrolledCourseId, studentProfile, coursesList]);

  const enrolledCourseName = useMemo(() => {
    if (!effectiveEnrolledCourseId) return "";
    return getCourseDisplayName(effectiveEnrolledCourseId);
  }, [effectiveEnrolledCourseId, coursesList]);

  // Names of all assigned courses for Professor / HOD
  const assignedCoursesNames = useMemo(() => {
    if (!assignedCourseIds || assignedCourseIds.length === 0) return "";
    return assignedCourseIds
      .map(id => getCourseDisplayName(id))
      .filter(name => name && name !== "-")
      .join(", ");
  }, [assignedCourseIds, coursesList]);

  // Available courses for Add/Edit Form: HOD can only select from their assigned department courses
  const availableCoursesForForm = useMemo(() => {
    if (isHOD && assignedCourseIds.length > 0) {
      return coursesList.filter(c => assignedCourseIds.includes(Number(c.course_id || c.id)));
    }
    return coursesList;
  }, [coursesList, isHOD, assignedCourseIds]);

  // Course-scoped classes:
  // - Student (4) strictly sees enrolled course classes
  // - Professor (3) & HOD (1) strictly see classes of all their assigned courses
  // - Principal (2) sees all college classes
  const courseScopedClasses = useMemo(() => {
    if (roleId === 4 && effectiveEnrolledCourseId) {
      return classList.filter(item => Number(item.course_id || item.courseId) === Number(effectiveEnrolledCourseId));
    }
    if ((roleId === 3 || roleId === 1) && assignedCourseIds.length > 0) {
      return classList.filter(item => assignedCourseIds.includes(Number(item.course_id || item.courseId)));
    }
    return classList;
  }, [classList, roleId, effectiveEnrolledCourseId, assignedCourseIds]);

  // Available courses for the filter dropdown
  const availableFilterCourses = useMemo(() => {
    const courseIdsInClasses = new Set(
      courseScopedClasses.map(c => Number(c.course_id || c.courseId)).filter(Boolean)
    );
    return coursesList.filter(c => courseIdsInClasses.has(Number(c.course_id || c.id)));
  }, [courseScopedClasses, coursesList]);

  // Filtered classes by search term and selected course filter
  const filteredClasses = useMemo(() => {
    let list = courseScopedClasses;
    if (selectedCourseFilter !== "ALL") {
      list = list.filter(item => Number(item.course_id || item.courseId) === Number(selectedCourseFilter));
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter(item => {
      const name = (item.class_name || item.className || '').toLowerCase();
      const course = String(getCourseDisplayName(item.course_id || item.courseId) || '').toLowerCase();
      const building = String(item.building_no || item.buildingNo || '').toLowerCase();
      const floor = String(item.floor_no || item.floorNo || '').toLowerCase();
      const room = String(item.room_no || item.roomNo || '').toLowerCase();
      return name.includes(term) || course.includes(term) || building.includes(term) || floor.includes(term) || room.includes(term);
    });
  }, [courseScopedClasses, selectedCourseFilter, searchTerm, coursesList]);

  // Dynamic Metrics scoped to displayed catalog
  const totalClasses = courseScopedClasses.length;
  const uniqueBuildings = useMemo(() => {
    const buildings = new Set();
    courseScopedClasses.forEach(c => {
      const b = (c.building_no || c.buildingNo || '').trim();
      if (b) buildings.add(b);
    });
    return buildings.size;
  }, [courseScopedClasses]);

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
    iconColor: "#0d9488",
    badgeTealBg: darkMode ? "rgba(13, 148, 136, 0.2)" : "rgba(13, 148, 136, 0.1)",
    badgeTealText: "#0d9488"
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false) => {
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
          <input
            type={type}
            name={name}
            value={classData[name]}
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
        maxWidth: "1050px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Teal Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
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
                <FaUniversity size={24} />
              </div>
              <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Class Management Module
              </h2>
            </div>
            <p style={{ margin: "6px 0 0 0", opacity: 0.95, fontSize: "14px", fontWeight: "500" }}>
              {isPrincipal
                ? "👑 Principal Control Mode - Add & Manage All College Class Rooms & Labs"
                : isHOD
                ? `👔 HOD Control Mode - Managing ${assignedCoursesNames ? `[${assignedCoursesNames}]` : "Department"} Class Rooms & Labs`
                : isProfessor
                ? `👨‍🏫 Faculty View Mode - Viewing ${assignedCoursesNames ? `[${assignedCoursesNames}]` : "Department"} Classrooms & Lab Directory`
                : "🎓 Student View Mode - View Your Enrolled Course Classroom Directory"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
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
            <div style={{ background: themeStyles.badgeTealBg, color: themeStyles.badgeTealText, padding: "12px", borderRadius: "12px" }}>
              <FaChalkboardTeacher size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Total Classes</span>
              <div style={{ fontSize: "20px", fontWeight: "900", color: themeStyles.textPrimary }}>{totalClasses} Classes</div>
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
            <div style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", padding: "12px", borderRadius: "12px" }}>
              <FaBuilding size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Buildings</span>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#6366f1" }}>{uniqueBuildings || 1} Blocks</div>
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
              <FaEye size={20} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Access Status</span>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#10b981" }}>
                {canAddEdit ? "Full Read / Write" : "Read-Only View"}
              </div>
            </div>
          </div>
        </div>

        {/* 📝 Form Body - Visible ONLY to Principal (2) & HOD (1) */}
        {canAddEdit ? (
          <form onSubmit={handleSave} style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "800" }}>
                {editingId ? "✏️ Edit Class Details" : "➕ Add New Class"}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              {renderInputField("Class Name", "class_name", "e.g. CS-Section A", FaChalkboardTeacher, "text", true)}

              {/* Course Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Course Name
                </label>
                {coursesList.length > 0 ? (
                  <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                    <div style={{ position: "absolute", left: "14px", color: themeStyles.iconColor, pointerEvents: "none", zIndex: 10 }}>
                      <FaGraduationCap size={16} />
                    </div>
                    <select
                      name="course_id"
                      value={classData.course_id}
                      onChange={handleInputChange}
                      style={{
                        width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500", outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Course {isHOD ? "(Department Course Required)" : "(Optional)"} --</option>
                      {availableCoursesForForm.map(c => (
                        <option key={c.course_id || c.id} value={c.course_id || c.id}>
                          {c.course_name || c.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  renderInputField("Course ID", "course_id", "e.g. 101", FaGraduationCap, "number", false)
                )}
                {classData.course_id && (
                  <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: "600" }}>
                    Selected: <strong>{getCourseDisplayName(classData.course_id)}</strong>
                  </span>
                )}
              </div>

              {renderInputField("Building No", "building_no", "e.g. Block A", FaBuilding, "text", false)}
              {renderInputField("Floor No", "floor_no", "e.g. 2nd Floor", FaLayerGroup, "text", false)}
              {renderInputField("Room No", "room_no", "e.g. Room 204", FaDoorClosed, "text", false)}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "14px",
              marginTop: "28px",
              justifyContent: "flex-end",
              alignItems: "center"
            }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 36px",
                  background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(13, 148, 136, 0.35)",
                  transition: "all 0.2s ease",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                <FaSave size={14} /> {submitting ? "Saving..." : (editingId ? "Update Class" : "Save Class")}
              </button>
            </div>
          </form>
        ) : isProfessor ? (
          <div style={{
            margin: "24px 32px 0 32px",
            padding: "20px 24px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)"
              : "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
            borderRadius: "16px",
            border: "1.5px solid rgba(13, 148, 136, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 15px rgba(13, 148, 136, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "#0d9488",
                color: "#ffffff",
                padding: "14px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)"
              }}>
                <FaChalkboardTeacher size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#0d9488", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Faculty Academic View
                  </span>
                  <span style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#059669",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700"
                  }}>
                    👁 Read-Only Faculty Directory
                  </span>
                </div>
                <h4 style={{ margin: "4px 0 2px 0", fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  {assignedCoursesNames || "Assigned Academic Department"} Classes & Labs
                </h4>
                <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                  Faculty: <strong>{user?.full_name || user?.name || "Professor"}</strong> • Class room allocations and timetable schedules are read-only. Creation and room edits are managed by HOD & Principal.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/course')}
              style={{
                padding: "8px 16px",
                background: "#0d9488",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaUniversity size={12} /> View Department Course
            </button>
          </div>
        ) : (
          <div style={{
            margin: "24px 32px 0 32px",
            padding: "20px 24px",
            background: darkMode
              ? "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)"
              : "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
            borderRadius: "16px",
            border: "1.5px solid rgba(13, 148, 136, 0.3)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 15px rgba(13, 148, 136, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "#0d9488",
                color: "#ffffff",
                padding: "14px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)"
              }}>
                <FaGraduationCap size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#0d9488", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Enrolled Degree Program
                  </span>
                  <span style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#059669",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "700"
                  }}>
                    ✓ Showing Your Course Classrooms Only
                  </span>
                </div>
                <h4 style={{ margin: "4px 0 2px 0", fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  {enrolledCourseName || "Your Degree Program"}
                </h4>
                <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                  {studentProfile?.student_name || studentProfile?.studentName ? `Student: ${studentProfile.student_name || studentProfile.studentName} | ` : ""}
                  All other degree program classrooms (e.g. other courses) are filtered out.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/course')}
              style={{
                padding: "8px 16px",
                background: "#0d9488",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FaUniversity size={12} /> View Degree Course
            </button>
          </div>
        )}

        <hr style={{ border: "none", borderTop: `1px solid ${themeStyles.cardBorder}`, margin: "0" }} />

        {/* 📋 Class Directory Section */}
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
                Class Directory List
              </h3>
              <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                Showing {filteredClasses.length} of {totalClasses} classes
              </span>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Course Filter Dropdown (visible when multiple courses are present in user's scope) */}
              {availableFilterCourses.length > 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: themeStyles.inputBg,
                  border: `1.5px solid ${themeStyles.inputBorder}`,
                  borderRadius: "12px",
                  padding: "6px 12px",
                  gap: "6px"
                }}>
                  <FaFilter size={13} color={themeStyles.iconColor} />
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: themeStyles.textPrimary,
                      fontSize: "13px",
                      fontWeight: "600",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="ALL" style={{ background: themeStyles.cardBg, color: themeStyles.textPrimary }}>
                      All Courses ({courseScopedClasses.length})
                    </option>
                    {availableFilterCourses.map(c => {
                      const cId = c.course_id || c.id;
                      const count = courseScopedClasses.filter(item => Number(item.course_id || item.courseId) === Number(cId)).length;
                      return (
                        <option key={cId} value={cId} style={{ background: themeStyles.cardBg, color: themeStyles.textPrimary }}>
                          {c.course_name || c.courseName} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                background: themeStyles.inputBg,
                border: `1.5px solid ${themeStyles.inputBorder}`,
                borderRadius: "12px",
                padding: "8px 14px",
                minWidth: "260px"
              }}>
                <FaSearch size={14} color={themeStyles.iconColor} style={{ marginRight: "10px" }} />
                <input
                  type="text"
                  placeholder="Search class, room, course..."
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
                onClick={fetchClasses}
                title="Refresh Class List"
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
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>#</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Class Name</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Course Name</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Building No</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Floor No</th>
                  <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary }}>Room No</th>
                  {canAddEdit && (
                    <th style={{ padding: "14px 16px", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", color: themeStyles.textSecondary, textAlign: "right" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canAddEdit ? 7 : 6} style={{ padding: "30px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading class records...
                    </td>
                  </tr>
                ) : filteredClasses.length > 0 ? (
                  filteredClasses.map((item, idx) => {
                    const id = item.class_id || item.classId || item.id || idx;
                    const name = item.class_name || item.className || "-";
                    const courseId = item.course_id || item.courseId || "-";
                    const building = item.building_no || item.buildingNo || "-";
                    const floor = item.floor_no || item.floorNo || "-";
                    const room = item.room_no || item.roomNo || "-";

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
                        <td style={{ padding: "14px 16px", color: themeStyles.textSecondary, fontWeight: "700" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 16px", fontWeight: "800", color: themeStyles.textPrimary }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <FaChalkboardTeacher color="#0d9488" size={14} /> {name}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {courseId && courseId !== "-" ? (
                            <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                              {getCourseDisplayName(courseId)}
                            </div>
                          ) : (
                            <span style={{ color: themeStyles.textSecondary }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", color: themeStyles.textSecondary, fontWeight: "600" }}>
                          {building}
                        </td>
                        <td style={{ padding: "14px 16px", color: themeStyles.textSecondary, fontWeight: "600" }}>
                          {floor}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "12px"
                          }}>
                            🚪 {room}
                          </span>
                        </td>
                        {canAddEdit && (
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                title="Edit Class"
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
                                title="Delete Class"
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
                    <td colSpan={canAddEdit ? 7 : 6} style={{ padding: "40px 20px", textAlign: "center" }}>
                      <div style={{ color: themeStyles.textSecondary, fontSize: "15px", fontWeight: "600" }}>
                        {searchTerm
                          ? "No classes match your search query."
                          : isStudent
                          ? `No classrooms or sections found for your enrolled degree program (${enrolledCourseName || "your program"}).`
                          : "No class records found. Use the form above to add one."}
                      </div>
                      <span style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "4px", display: "inline-block" }}>
                        {isStudent
                          ? "Your department faculty will register classroom and laboratory locations here."
                          : "Enter classroom details in the form above to register a room."}
                      </span>
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

export default ClassMgmt;