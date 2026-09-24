import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaBarcode, FaAward, FaLayerGroup,
  FaGraduationCap, FaFileAlt, FaArrowLeft, FaSave,
  FaSearch, FaFilter, FaPlus, FaTimes, FaEdit,
  FaTrashAlt, FaCheck, FaExclamationCircle, FaThList,
  FaFlask, FaCheckCircle, FaLaptopCode
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Subject() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // --- Role-Based Access Control (RBAC) ---
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const isPrincipal = roleId === 2;
  const isHOD = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  const canAddEdit = isPrincipal || isHOD; // Role 1 = HOD, Role 2 = Principal (Prof & Student View-Only)

  // --- States ---
  const [subjectList, setSubjectList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolledCourseId, setEnrolledCourseId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [professorAssignedCourseId, setProfessorAssignedCourseId] = useState(null);
  const [professorProfile, setProfessorProfile] = useState(null);

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL"); // ALL, Theory, Practical, Elective, Mandatory
  const [selectedCourseId, setSelectedCourseId] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Form
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null); // null = Add, object = Edit
  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    subjectCredit: "",
    subjectType: "Theory",
    courseId: "",
    examId: "",
    staffId: ""
  });

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch Student Profile (to resolve enrolled course for Student Role 4)
  const fetchStudentProfile = async () => {
    if (roleId !== 4) return;
    try {
      const res = await axios.get("http://localhost:8080/student/all", { headers: getAuthHeaders() });
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      if (list.length > 0) {
        const userEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
        const userId = user?.user_id || user?.userId || user?.id;
        const userMobile = (user?.mobile_no || user?.mobileno || user?.mobile || "").trim();
        const userName = (user?.full_name || user?.name || user?.username || "").toLowerCase().trim();

        const matchedStudent = list.find(s => {
          const sEmail = (s.email || "").toLowerCase().trim();
          const sUserId = s.user_id || s.userId || s.user?.user_id;
          const sMobile = (s.mobileno || s.mobile || "").trim();
          const sName = (s.student_name || s.studentName || s.name || "").toLowerCase().trim();

          if (userEmail && sEmail && sEmail === userEmail) return true;
          if (userId && sUserId && String(sUserId) === String(userId)) return true;
          if (userMobile && sMobile && sMobile === userMobile) return true;
          if (userName && sName && sName === userName) return true;
          return false;
        });

        const s = matchedStudent || list[0];
        setStudentProfile(s);
        const cId = Number(s.course_id || s.courseId);
        if (cId) {
          setEnrolledCourseId(cId);
          setSelectedCourseId(String(cId));
        }
      }
    } catch (err) {
      console.error("Error fetching student profile in Subject:", err);
    }
  };

  // Fetch Professor Profile (to resolve assigned course for Professor Role 3)
  const fetchProfessorProfile = async () => {
    if (roleId !== 3) return;
    try {
      const res = await axios.get("http://localhost:8080/staff/all", { headers: getAuthHeaders() });
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const currentEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
      const currentUserId = user?.user_id || user?.userId || null;

      const matchedStaff = list.find(st => 
        (currentEmail && st.email?.toLowerCase().trim() === currentEmail) ||
        (currentUserId && Number(st.user_id || st.userId) === Number(currentUserId))
      );

      if (matchedStaff) {
        setProfessorProfile(matchedStaff);
        const cId = Number(matchedStaff.course_id || matchedStaff.courseId);
        if (cId) {
          setProfessorAssignedCourseId(cId);
        }
        // Keep default selectedCourseId as "ALL" so all assigned department courses are visible
      }
    } catch (err) {
      console.error("Error fetching professor profile in Subject:", err);
    }
  };

  const fetchContextData = async () => {
    const headers = getAuthHeaders();
    try {
      let cRes;
      try {
        cRes = await axios.get("http://localhost:8080/api/courses/all", { headers });
      } catch {
        cRes = await axios.get("http://localhost:8080/api/courses", { headers });
      }
      if (cRes?.data) setCoursesList(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || []));
    } catch {}

    try {
      let eRes;
      try {
        eRes = await axios.get("http://localhost:8080/api/exams/lookup", { headers });
      } catch {
        try {
          eRes = await axios.get("http://localhost:8080/exam/all?all=true", { headers });
        } catch {
          eRes = await axios.get("http://localhost:8080/api/exams", { headers });
        }
      }
      if (eRes?.data) setExamsList(Array.isArray(eRes.data) ? eRes.data : (eRes.data?.content || []));
    } catch {}

    try {
      const sRes = await axios.get("http://localhost:8080/staff/all", { headers });
      if (sRes?.data) setStaffList(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []));
    } catch {}
  };

  const getStaffCourseIds = (st) => {
    if (!st) return [];
    const ids = new Set();
    const rawIds = st.course_ids ?? st.courseIds;
    if (rawIds) {
      String(rawIds).split(",").forEach(s => {
        const n = parseInt(s.trim(), 10);
        if (!isNaN(n)) ids.add(n);
      });
    }
    const single = st.course_id ?? st.courseId;
    if (single !== undefined && single !== null && single !== "") {
      const n = parseInt(single, 10);
      if (!isNaN(n)) ids.add(n);
    }
    return Array.from(ids);
  };

  const getCourseDisplayName = (cId, item = null) => {
    if (item && (item.course_name || item.courseName)) {
      const name = item.course_name || item.courseName;
      return `${name}${item.semester ? ` (${item.semester})` : ""}`;
    }
    if (!cId) return "-";
    const c = coursesList.find(cItem => Number(cItem.course_id || cItem.courseId || cItem.id) === Number(cId));
    if (c && (c.course_name || c.courseName)) {
      return `${c.course_name || c.courseName}${c.semester ? ` (${c.semester})` : ""}`;
    }
    return `Course #${cId}`;
  };

  const getExamDisplayName = (eId, item = null) => {
    // 1. Direct exam name / type from item populated by backend
    if (item && (item.exam_name || item.examName || item.exam_type || item.examType)) {
      return item.exam_name || item.examName || item.exam_type || item.examType;
    }
    if (!eId || eId === "-") return "-";
    // 2. Lookup in examsList
    const e = examsList.find(item => Number(item.exam_id || item.examId || item.id) === Number(eId));
    if (e) {
      const name = e.exam_name || e.examName || e.exam_type || e.examType;
      if (name && name.trim()) return name;
    }
    return `Exam #${eId}`;
  };

  // Fetch Subjects from Backend
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/subjects/all", { headers: getAuthHeaders() });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/subjects/all", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setSubjectList(data);

      // If student and subjects belong to one course, auto-sync enrolledCourseId
      if (roleId === 4 && data.length > 0 && !enrolledCourseId) {
        const autoCId = Number(data[0].courseId || data[0].course_id);
        if (autoCId) {
          setEnrolledCourseId(autoCId);
          setSelectedCourseId(String(autoCId));
        }
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      showToast("Could not load subjects from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchContextData();
    if (roleId === 4) {
      fetchStudentProfile();
    }
    if (roleId === 3) {
      fetchProfessorProfile();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "courseId") {
      setFormData({
        ...formData,
        courseId: value
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Filter exams: matching selected course first, followed by all other available exams
  const availableExams = useMemo(() => {
    if (!examsList || examsList.length === 0) return [];
    if (!formData.courseId) return examsList;
    const matching = examsList.filter(
      (e) => Number(e.course_id || e.courseId) === Number(formData.courseId)
    );
    const others = examsList.filter(
      (e) => Number(e.course_id || e.courseId) !== Number(formData.courseId)
    );
    return [...matching, ...others];
  }, [formData.courseId, examsList]);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subjectName: "",
      subjectCode: "",
      subjectCredit: "",
      subjectType: "Theory",
      courseId: "",
      examId: "",
      staffId: ""
    });
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subjectName: subject.subjectName || subject.subject_name || "",
      subjectCode: subject.subjectCode || subject.subject_code || "",
      subjectCredit: subject.subjectCredit || subject.subject_credit || "",
      subjectType: subject.subjectType || subject.subject_type || "Theory",
      courseId: subject.courseId || subject.course_id || "",
      examId: subject.examId || subject.exam_id || "",
      staffId: subject.staffId || subject.staff_id || ""
    });
    setShowModal(true);
  };

  // Save or Update Subject
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      subjectName: formData.subjectName.trim(),
      subjectCode: formData.subjectCode.trim(),
      subjectCredit: parseInt(formData.subjectCredit) || 0,
      subjectType: formData.subjectType,
      courseId: parseInt(formData.courseId) || 1,
      examId: parseInt(formData.examId) || 1,
      staffId: formData.staffId ? parseInt(formData.staffId) : null
    };

    try {
      if (editingSubject && (editingSubject.id || editingSubject.subject_id)) {
        const id = editingSubject.id || editingSubject.subject_id;
        try {
          await axios.put(`http://localhost:8080/subjects/${id}`, payload, { headers: getAuthHeaders() });
        } catch {
          await axios.put(`http://localhost:8080/api/subjects/${id}`, payload, { headers: getAuthHeaders() });
        }
        showToast("Subject updated successfully!");
      } else {
        try {
          await axios.post("http://localhost:8080/subjects/save", payload, { headers: getAuthHeaders() });
        } catch {
          await axios.post("http://localhost:8080/api/subjects/save", payload, { headers: getAuthHeaders() });
        }
        showToast("New Subject registered successfully!");
      }

      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Save error:", error);
      showToast(error.response?.data?.message || "Error saving subject record.", "error");
    }
  };

  // Delete Subject
  const handleDelete = async (subject) => {
    const id = subject.id || subject.subject_id;
    if (!id) return;

    if (!window.confirm(`Are you sure you want to delete "${subject.subjectName || subject.subject_name}"?`)) {
      return;
    }

    try {
      try {
        await axios.delete(`http://localhost:8080/subjects/${id}`, { headers: getAuthHeaders() });
      } catch {
        await axios.delete(`http://localhost:8080/api/subjects/${id}`, { headers: getAuthHeaders() });
      }
      showToast("Subject removed successfully.");
      fetchSubjects();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete subject. Check dependencies.", "error");
    }
  };

  // Unique Course IDs for filter
  const uniqueCourseIds = useMemo(() => {
    const ids = new Set();
    subjectList.forEach(s => {
      const cId = s.courseId || s.course_id;
      if (cId) ids.add(String(cId));
    });
    return Array.from(ids);
  }, [subjectList]);

  // Filter & Search Logic
  const filteredSubjects = useMemo(() => {
    return subjectList.filter(item => {
      const cId = Number(item.courseId || item.course_id || 0);

      // Enforce student enrolled course subject isolation
      if (isStudent && enrolledCourseId) {
        if (cId !== enrolledCourseId) return false;
      }

      const name = (item.subjectName || item.subject_name || "").toLowerCase();
      const code = (item.subjectCode || item.subject_code || "").toLowerCase();
      const type = (item.subjectType || item.subject_type || "").toLowerCase();
      const courseIdStr = String(cId || "");
      const term = searchTerm.toLowerCase();

      const matchesSearch = name.includes(term) || code.includes(term) || courseIdStr.includes(term);
      const matchesType = selectedType === "ALL" || type.includes(selectedType.toLowerCase());
      const matchesCourse = isStudent ? true : (selectedCourseId === "ALL" || courseIdStr === selectedCourseId);

      return matchesSearch && matchesType && matchesCourse;
    });
  }, [subjectList, searchTerm, selectedType, selectedCourseId, isStudent, enrolledCourseId]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage) || 1;
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubjects.slice(start, start + itemsPerPage);
  }, [filteredSubjects, currentPage]);

  // Quick Stats
  const targetSubjects = isStudent && enrolledCourseId
    ? subjectList.filter(s => Number(s.courseId || s.course_id) === enrolledCourseId)
    : subjectList;
  const totalSubjectsCount = targetSubjects.length;
  const theoryCount = targetSubjects.filter(s => (s.subjectType || s.subject_type || "").toLowerCase().includes("theory")).length;
  const practicalCount = targetSubjects.filter(s => (s.subjectType || s.subject_type || "").toLowerCase().includes("practical") || (s.subjectType || s.subject_type || "").toLowerCase().includes("lab")).length;

  // Type Tag Color Helper
  const getTypeBadgeStyle = (typeStr) => {
    const t = (typeStr || "").toLowerCase();
    if (t.includes("theory")) {
      return { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1", border: "rgba(99, 102, 241, 0.3)" };
    }
    if (t.includes("practical") || t.includes("lab")) {
      return { bg: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" };
    }
    if (t.includes("elective")) {
      return { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" };
    }
    return { bg: "rgba(236, 72, 153, 0.12)", color: "#ec4899", border: "rgba(236, 72, 153, 0.3)" };
  };

  // Theme Styles
  const theme = {
    bg: darkMode ? "linear-gradient(135deg, #090d16 0%, #0f172a 100%)" : "linear-gradient(135deg, #f0f4fd 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#151e2e" : "#ffffff",
    cardHover: darkMode ? "#1c2638" : "#f8fafc",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#293548" : "#cbd5e1",
    amberGrad: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
    shadow: darkMode ? "0 20px 45px rgba(0, 0, 0, 0.5)" : "0 10px 30px rgba(245, 158, 11, 0.08)"
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: theme.bg,
      padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center",
      boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>

      {/* TOAST POPUP */}
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

      <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "22px" }}>

        {/* 🌟 1. HERO HEADER */}
        <div style={{
          background: theme.amberGrad, borderRadius: "22px", padding: "28px 34px",
          color: "#ffffff", display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "16px",
          boxShadow: "0 14px 35px rgba(245, 158, 11, 0.3)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.22)", padding: "14px", borderRadius: "16px",
              display: "flex", backdropFilter: "blur(8px)"
            }}>
              <FaBook size={30} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                  Subject Directory & Syllabus
                </h1>
                <span style={{
                  fontSize: "11px", fontWeight: "800", background: "rgba(0,0,0,0.25)",
                  padding: "4px 10px", borderRadius: "10px", textTransform: "uppercase"
                }}>
                  {canAddEdit ? "Manager Mode" : "View Only"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
                Browse curriculum subjects, exam weightage, theory & practical credit distribution.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {canAddEdit && (
              <button
                onClick={openAddModal}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", background: "#ffffff",
                  color: "#d97706", padding: "12px 22px", borderRadius: "12px", border: "none",
                  fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  transition: "transform 0.15s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <FaPlus /> Add New Subject
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.4)", color: "#ffffff", padding: "12px 20px",
                borderRadius: "12px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
              }}
            >
              <FaArrowLeft /> Dashboard
            </button>
          </div>
        </div>

        {/* 🎓 ENROLLED CURRICULUM BANNER (For Students) */}
        {isStudent && (
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            border: "2px solid #3b82f6",
            borderRadius: "20px",
            padding: "22px 28px",
            boxShadow: "0 12px 30px rgba(59, 130, 246, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(59, 130, 246, 0.2)",
                padding: "16px",
                borderRadius: "16px",
                color: "#60a5fa",
                display: "flex"
              }}>
                <FaGraduationCap size={32} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#ffffff" }}>
                    🎓 Enrolled Course: {getCourseDisplayName(enrolledCourseId)}
                  </h2>
                  <span style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800"
                  }}>
                    ✓ Showing Your Syllabus Only
                  </span>
                  {enrolledCourseId && (
                    <span style={{
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#a5b4fc",
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      Course ID #{enrolledCourseId}
                    </span>
                  )}
                </div>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                  Student: <strong style={{ color: "#f8fafc" }}>{studentProfile?.student_name || user?.full_name || "Student"}</strong> (ID #{studentProfile?.student_id || user?.user_id}) • Displaying subjects & credits strictly for your enrolled branch.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/course")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(37, 99, 235, 0.35)",
                transition: "transform 0.15s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <FaGraduationCap /> View Degree Program
            </button>
          </div>
        )}

        {/* 👨‍🏫 FACULTY DEPARTMENT SYLLABUS BANNER (For Professors) */}
        {isProfessor && (
          <div style={{
            background: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
            border: "2px solid #10b981",
            borderRadius: "20px",
            padding: "22px 28px",
            boxShadow: "0 12px 30px rgba(16, 185, 129, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(16, 185, 129, 0.2)",
                padding: "16px",
                borderRadius: "16px",
                color: "#34d399",
                display: "flex"
              }}>
                <FaGraduationCap size={32} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#ffffff" }}>
                    👨‍🏫 Department Course: {getCourseDisplayName(professorAssignedCourseId)}
                  </h2>
                  <span style={{
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6ee7b7",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800"
                  }}>
                    ✓ Faculty Syllabus View ({uniqueCourseIds.length} Assigned Course{uniqueCourseIds.length !== 1 ? 's' : ''})
                  </span>
                  {uniqueCourseIds.map((cid) => (
                    <span key={cid} style={{
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#a5b4fc",
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      {getCourseDisplayName(cid)}
                    </span>
                  ))}
                </div>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                  Faculty: <strong style={{ color: "#f8fafc" }}>{user?.full_name || user?.name || "Professor"}</strong> • Displaying curriculum subjects for your assigned courses: <strong style={{ color: "#38bdf8" }}>{uniqueCourseIds.map(id => getCourseDisplayName(id)).join(" • ") || "Assigned Courses"}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/course")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35)",
                transition: "transform 0.15s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <FaGraduationCap /> View Department Program
            </button>
          </div>
        )}

        {/* 📊 2. METRICS STATS TILES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaBook />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>
                {isStudent ? "Enrolled Subjects" : isProfessor ? "Department Subjects" : "Total Subjects"}
              </span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: theme.textPrimary }}>{totalSubjectsCount} Listed</div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaFileAlt />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Theory Modules</span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: "#6366f1" }}>{theoryCount} Subjects</div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaFlask />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Lab / Practicals</span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: "#10b981" }}>{practicalCount} Labs</div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(236, 72, 153, 0.12)", color: "#ec4899", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaAward />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Curriculum Sync</span>
              <div style={{ fontSize: "18px", fontWeight: "900", color: theme.textPrimary }}>
                {isStudent ? "Enrolled Syllabus" : "Autonomous CBCS"}
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 3. ADVANCED SEARCH & FILTER CONTROL BAR */}
        <div style={{
          background: theme.cardBg, borderRadius: "18px", padding: "20px 24px",
          border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow,
          display: "flex", flexDirection: "column", gap: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>

            {/* Search Input */}
            <div style={{
              flex: "1 1 340px", display: "flex", alignItems: "center", gap: "10px",
              background: theme.inputBg, border: `1.5px solid ${theme.inputBorder}`,
              padding: "12px 18px", borderRadius: "12px"
            }}>
              <FaSearch color="#f59e0b" size={16} />
              <input
                type="text"
                placeholder="Search by subject name (e.g. Data Structures), subject code, course ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: theme.textPrimary, width: "100%", fontSize: "14px", fontWeight: "600"
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer" }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>

              {/* Course ID Filter */}
              {isStudent ? (
                <div style={{
                  padding: "10px 16px", borderRadius: "12px", border: "1.5px solid #3b82f6",
                  background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa", fontSize: "13px", fontWeight: "800",
                  display: "flex", alignItems: "center", gap: "8px"
                }}>
                  <FaGraduationCap /> {getCourseDisplayName(enrolledCourseId)}
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => { setSelectedCourseId(e.target.value); setCurrentPage(1); }}
                  style={{
                    padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                    background: theme.inputBg, color: theme.textPrimary, fontSize: "13px", fontWeight: "700",
                    outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="ALL">
                    {isProfessor ? `All My Assigned Courses (${uniqueCourseIds.length})` : "All Courses"}
                  </option>
                  {uniqueCourseIds.map((id, idx) => (
                    <option key={idx} value={id}>{getCourseDisplayName(id)}</option>
                  ))}
                </select>
              )}

              {/* Reset Filter Button */}
              {(searchTerm || selectedType !== "ALL" || selectedCourseId !== "ALL") && (
                <button
                  onClick={() => { setSearchTerm(""); setSelectedType("ALL"); setSelectedCourseId("ALL"); setCurrentPage(1); }}
                  style={{
                    padding: "10px 16px", borderRadius: "12px", border: "none",
                    background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontWeight: "700",
                    fontSize: "12px", cursor: "pointer"
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>

          </div>

          {/* Type Filter Quick Chips */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", paddingTop: "2px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary }}>Subject Type:</span>
            {["ALL", "Theory", "Practical", "Elective", "Mandatory"].map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setCurrentPage(1); }}
                  style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                    cursor: "pointer", border: "none",
                    background: active ? "#f59e0b" : theme.inputBg,
                    color: active ? "#ffffff" : theme.textSecondary,
                    boxShadow: active ? "0 4px 12px rgba(245, 158, 11, 0.3)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  {type === "ALL" ? "All Types" : type}
                </button>
              );
            })}
          </div>

        </div>

        {/* 📋 4. DATA TABLE DIRECTORY */}
        <div style={{
          background: theme.cardBg, borderRadius: "20px",
          border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow,
          overflow: "hidden"
        }}>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: theme.inputBg, borderBottom: `2px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
                  <th style={{ padding: "16px 20px", fontWeight: "800", width: "60px" }}>#</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>SUBJECT NAME</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>SUBJECT CODE</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>CREDITS</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>TYPE</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>COURSE (ID / NAME)</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>EXAM (ID / NAME)</th>
                  {canAddEdit && <th style={{ padding: "16px 20px", fontWeight: "800", textAlign: "right" }}>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: "40px 20px", textAlign: "center", color: theme.textSecondary, fontWeight: "600" }}>
                      Loading academic subjects...
                    </td>
                  </tr>
                ) : paginatedSubjects.length > 0 ? (
                  paginatedSubjects.map((item, idx) => {
                    const sName = item.subjectName || item.subject_name || "-";
                    const sCode = item.subjectCode || item.subject_code || "-";
                    const sCredit = item.subjectCredit || item.subject_credit || "0";
                    const sType = item.subjectType || item.subject_type || "Theory";
                    const cId = item.courseId || item.course_id || "-";
                    const eId = item.examId || item.exam_id || "-";
                    const badge = getTypeBadgeStyle(sType);

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: `1px solid ${theme.cardBorder}`,
                          transition: "background 0.15s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = theme.cardHover}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px 20px", color: theme.textSecondary, fontWeight: "700" }}>
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "800", color: theme.textPrimary }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: badge.color }} />
                            {sName}
                          </div>
                          {(item.staff_name || item.staffName) && (
                            <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: "700", color: "#a855f7" }}>
                              👨‍🏫 Prof. {item.staff_name || item.staffName}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "700", color: "#f59e0b" }}>
                          <span style={{ background: "rgba(245, 158, 11, 0.1)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                            {sCode}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", fontWeight: "800", color: theme.textPrimary }}>
                          {sCredit} Credits
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "800",
                            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                          }}>
                            {sType}
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{ fontWeight: "800", color: theme.textPrimary }}>
                            {getCourseDisplayName(cId, item)}
                          </div>
                          {cId !== "-" && (
                            <span style={{
                              display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "700",
                              background: "rgba(99, 102, 241, 0.12)", color: "#6366f1",
                              padding: "2px 8px", borderRadius: "6px"
                            }}>
                              ID #{cId}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div style={{
                            fontWeight: "800",
                            color: theme.textPrimary,
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            <span style={{
                              background: "rgba(16, 185, 129, 0.15)",
                              color: "#10b981",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "13px",
                              fontWeight: "800",
                              border: "1px solid rgba(16, 185, 129, 0.3)"
                            }}>
                              📝 {getExamDisplayName(eId, item)}
                            </span>
                          </div>
                          {eId && eId !== "-" && (
                            <span style={{
                              display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "700",
                              background: "rgba(148, 163, 184, 0.12)", color: theme.textSecondary,
                              padding: "2px 8px", borderRadius: "6px"
                            }}>
                              Exam ID #{eId}
                            </span>
                          )}
                        </td>

                        {canAddEdit && (
                          <td style={{ padding: "16px 20px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit Subject"
                                style={{
                                  padding: "8px 12px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`,
                                  background: theme.cardBg, color: theme.textSecondary, cursor: "pointer", fontSize: "12px",
                                  display: "flex", alignItems: "center", gap: "4px"
                                }}
                              >
                                <FaEdit /> Edit
                              </button>

                              <button
                                onClick={() => handleDelete(item)}
                                title="Delete Subject"
                                style={{
                                  padding: "8px 10px", borderRadius: "8px", border: "none",
                                  background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer", fontSize: "12px"
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
                    <td colSpan="8" style={{ padding: "50px 20px", textAlign: "center", color: theme.textSecondary }}>
                      <FaBook size={36} style={{ opacity: 0.3, marginBottom: "12px" }} />
                      <div style={{ fontSize: "16px", fontWeight: "800", color: theme.textPrimary }}>No subjects match your query</div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Try searching with a different code or reset filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 📄 PAGINATION FOOTER */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 24px", background: theme.inputBg, borderTop: `1px solid ${theme.cardBorder}`
            }}>
              <span style={{ fontSize: "13px", color: theme.textSecondary, fontWeight: "600" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length} subjects
              </span>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 14px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`,
                    background: theme.cardBg, color: currentPage === 1 ? theme.textSecondary : theme.textPrimary,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px", opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: "6px 12px", borderRadius: "8px", border: "none",
                      background: currentPage === pageNum ? "#f59e0b" : theme.cardBg,
                      color: currentPage === pageNum ? "#ffffff" : theme.textSecondary,
                      cursor: "pointer", fontWeight: "800", fontSize: "12px",
                      boxShadow: currentPage === pageNum ? "0 4px 10px rgba(245, 158, 11, 0.3)" : "none"
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 14px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`,
                    background: theme.cardBg, color: currentPage === totalPages ? theme.textSecondary : theme.textPrimary,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "12px", opacity: currentPage === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ✏️ 5. ADD / EDIT SUBJECT MODAL (FOR PRINCIPAL & HOD) */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
        }}>
          <div style={{
            background: theme.cardBg, borderRadius: "24px", padding: "34px", maxWidth: "600px", width: "100%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${theme.cardBorder}`
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "10px", borderRadius: "12px" }}>
                  <FaBook size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: theme.textPrimary }}>
                  {editingSubject ? "Edit Subject Details" : "Register New Subject"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", fontSize: "18px" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>
                  SUBJECT NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleChange}
                  style={{
                    padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                    background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>SUBJECT CODE *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS202"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>CREDITS *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4"
                    name="subjectCredit"
                    value={formData.subjectCredit}
                    onChange={handleChange}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>SUBJECT TYPE *</label>
                  <select
                    name="subjectType"
                    value={formData.subjectType}
                    onChange={handleChange}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                    }}
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical / Lab</option>
                    <option value="Elective">Elective</option>
                    <option value="Mandatory">Mandatory</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>COURSE (ID & NAME) *</label>
                  {coursesList.length > 0 ? (
                    <select
                      required
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      style={{
                        padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                        background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Course & Semester --</option>
                      {coursesList.map((c) => {
                        const cid = c.course_id || c.courseId || c.id;
                        const cname = c.course_name || c.courseName || `Course #${cid}`;
                        const csem = c.semester ? ` (${c.semester})` : "";
                        return (
                          <option key={cid} value={cid}>
                            {cname}{csem}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1"
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      style={{
                        padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                        background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                      }}
                    />
                  )}
                  {formData.courseId && (
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", marginTop: "2px" }}>
                      Selected: {getCourseDisplayName(formData.courseId)} (ID #{formData.courseId})
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>
                  EXAM TITLE (OPTIONAL)
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#10b981", marginLeft: "6px" }}>
                    (Link this subject to a semester exam)
                  </span>
                </label>
                {availableExams.length > 0 ? (
                  <select
                    name="examId"
                    value={formData.examId}
                    onChange={handleChange}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                    }}
                  >
                    <option value="">-- No Exam Scheduled Yet (Optional) --</option>
                    {availableExams.map((e) => {
                      const eid = e.exam_id || e.examId || e.id;
                      const ename = e.exam_name || e.examName || e.exam_type || e.examType || `Exam #${eid}`;
                      const isMatchingCourse = formData.courseId && Number(e.course_id || e.courseId) === Number(formData.courseId);
                      return (
                        <option key={eid} value={eid}>
                          {ename} (Exam ID #{eid}{isMatchingCourse ? " • This Course" : (e.course_name ? ` • Course: ${e.course_name}` : "")})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="e.g. 6 (Optional)"
                    name="examId"
                    value={formData.examId}
                    onChange={handleChange}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                )}
                {formData.examId && (
                  <div style={{
                    fontSize: "12px", fontWeight: "800", color: "#10b981", marginTop: "4px",
                    background: "rgba(16, 185, 129, 0.12)", padding: "8px 14px", borderRadius: "10px",
                    display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content",
                    border: "1px solid rgba(16, 185, 129, 0.25)"
                  }}>
                    <span>📝 Selected Exam:</span>
                    <strong style={{ color: theme.textPrimary }}>{getExamDisplayName(formData.examId)}</strong>
                    <span style={{ opacity: 0.8, fontSize: "11px" }}>(Exam ID #{formData.examId})</span>
                  </div>
                )}
              </div>

              {/* Assigned Professor / Faculty */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>
                  ASSIGNED PROFESSOR / FACULTY
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#6366f1", marginLeft: "6px" }}>
                    (Faculty who teaches and enters examination marks)
                  </span>
                </label>
                <select
                  name="staffId"
                  value={formData.staffId || ""}
                  onChange={handleChange}
                  style={{
                    padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                    background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                  }}
                >
                  <option value="">-- Select Teaching Professor (Optional) --</option>
                  {(() => {
                    if (!formData.courseId) {
                      return staffList.map((st) => (
                        <option key={st.staffid} value={st.staffid}>
                          {st.staffname} ({st.designation || 'Faculty'}) — {st.email}
                        </option>
                      ));
                    }

                    const selectedCourseObj = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(formData.courseId));
                    const courseDeptName = selectedCourseObj ? (selectedCourseObj.course_name || selectedCourseObj.courseName || `Course #${formData.courseId}`) : `Course #${formData.courseId}`;

                    // Group 1: Faculty already assigned to this specific course department
                    const deptFaculty = staffList.filter(st => {
                      const stCourseIds = getStaffCourseIds(st);
                      return stCourseIds.includes(Number(formData.courseId));
                    });

                    // Group 2: Available Faculty whose course is NULL / unassigned (Free to be assigned)
                    const availableNullFaculty = staffList.filter(st => {
                      const stCourseIds = getStaffCourseIds(st);
                      return stCourseIds.length === 0;
                    });

                    return (
                      <>
                        {deptFaculty.length > 0 && (
                          <optgroup label={`🏛️ ${courseDeptName} Department Faculty (Already Assigned)`}>
                            {deptFaculty.map((st) => (
                              <option key={st.staffid} value={st.staffid}>
                                {st.staffname} ({st.designation || 'Faculty'}) — {courseDeptName} Faculty
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {availableNullFaculty.length > 0 && (
                          <optgroup label="🟢 Available Faculty (No Course Assigned / NULL — Can be Assigned)">
                            {availableNullFaculty.map((st) => (
                              <option key={st.staffid} value={st.staffid}>
                                {st.staffname} ({st.designation || 'Faculty'}) — [Available / Free to Assign]
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {deptFaculty.length === 0 && availableNullFaculty.length === 0 && (
                          <option value="" disabled>No eligible faculty available for this course</option>
                        )}
                      </>
                    );
                  })()}
                </select>

                {/* Dynamic Status / Helper Pill for Selected Faculty */}
                {formData.staffId && (() => {
                  const selectedStaff = staffList.find(st => Number(st.staffid || st.staffId) === Number(formData.staffId));
                  if (!selectedStaff) return null;
                  const stCourseIds = getStaffCourseIds(selectedStaff);
                  const isDept = formData.courseId && stCourseIds.includes(Number(formData.courseId));
                  const isNull = stCourseIds.length === 0;

                  if (isDept) {
                    return (
                      <div style={{
                        fontSize: "12px", fontWeight: "700", color: "#0284c7", marginTop: "4px",
                        background: "rgba(2, 132, 199, 0.12)", padding: "8px 14px", borderRadius: "10px",
                        display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content",
                        border: "1px solid rgba(2, 132, 199, 0.25)"
                      }}>
                        <span>🏛️ Department Faculty:</span>
                        <strong style={{ color: theme.textPrimary }}>{selectedStaff.staffname}</strong>
                        <span style={{ fontSize: "11px", opacity: 0.8 }}>(Already belongs to this Course)</span>
                      </div>
                    );
                  }

                  if (isNull) {
                    return (
                      <div style={{
                        fontSize: "12px", fontWeight: "700", color: "#10b981", marginTop: "4px",
                        background: "rgba(16, 185, 129, 0.12)", padding: "8px 14px", borderRadius: "10px",
                        display: "inline-flex", alignItems: "center", gap: "8px", width: "fit-content",
                        border: "1px solid rgba(16, 185, 129, 0.25)"
                      }}>
                        <span>🟢 Available Faculty (Unassigned / NULL):</span>
                        <strong style={{ color: theme.textPrimary }}>{selectedStaff.staffname}</strong>
                        <span style={{ fontSize: "11px", opacity: 0.8 }}>(Free faculty — can be assigned to teach this subject!)</span>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "12px 20px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}`,
                    background: "none", color: theme.textSecondary, fontWeight: "700", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "12px 28px", borderRadius: "12px", border: "none",
                    background: theme.amberGrad, color: "white", fontWeight: "800", cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(245, 158, 11, 0.4)"
                  }}
                >
                  {editingSubject ? "Update Subject" : "Save Subject"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Subject;