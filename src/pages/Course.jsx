import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap, FaLayerGroup, FaMoneyBillWave,
  FaArrowLeft, FaSave, FaSearch, FaBook, FaCheckCircle,
  FaCalendarAlt, FaPrint, FaUniversity, FaPlus, FaTimes,
  FaThLarge, FaList, FaEye, FaEdit, FaTrashAlt, FaFilter,
  FaSortAmountDown, FaAward, FaInfoCircle, FaCheck
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Course() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // --- Auth & Role ---
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const isPrincipal = roleId === 2;
  const isHOD = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  const canManageCourse = isPrincipal || isHOD; // Role 1 = HOD, Role 2 = Principal (Prof & Student View-Only)

  // --- State Management ---
  const [courseList, setCourseList] = useState([]);
  const [allCoursesLookup, setAllCoursesLookup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [enrolledCourseId, setEnrolledCourseId] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemFilter, setSelectedSemFilter] = useState("ALL");
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name_asc"); // 'name_asc' | 'fee_low' | 'fee_high' | 'sem_asc'

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = Add, obj = Edit
  const [viewingCourse, setViewingCourse] = useState(null); // Detailed view modal

  // Normalization Helpers for Duplicate Checking
  const normalizeCourseName = (name) => {
    if (!name) return "";
    return String(name).trim().replace(/\s+/g, " ").toLowerCase();
  };

  const normalizeSemester = (sem) => {
    if (!sem) return "";
    const str = String(sem).trim().toLowerCase();
    const match = str.match(/\d+/);
    if (match) return match[0];
    return str.replace(/\s+/g, "");
  };

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    course_name: "",
    semester: "Semester 1",
    course_fee: "",
    course_code: "",
    credits: "24",
    department: "Computer Science & Engineering",
    description: ""
  });

  // Check registered semesters for the current course name being typed
  const registeredSemestersForCurrentCourse = useMemo(() => {
    if (!formData.course_name || !formData.course_name.trim()) return [];
    const targetName = normalizeCourseName(formData.course_name);
    const pool = (allCoursesLookup && allCoursesLookup.length > 0) ? allCoursesLookup : courseList;
    const currentId = editingCourse ? (editingCourse.course_id || editingCourse.id) : null;

    const matched = pool.filter(c => {
      const cId = c.course_id || c.id;
      if (currentId && Number(cId) === Number(currentId)) return false;
      return normalizeCourseName(c.course_name || c.courseName) === targetName;
    });

    return matched.map(c => c.semester || "").filter(Boolean);
  }, [formData.course_name, allCoursesLookup, courseList, editingCourse]);

  // Is currently selected semester duplicated for this course name?
  const isDuplicateSemester = useMemo(() => {
    if (!formData.course_name || !formData.course_name.trim() || !formData.semester) return false;
    const targetSemNorm = normalizeSemester(formData.semester);
    return registeredSemestersForCurrentCourse.some(sem => normalizeSemester(sem) === targetSemNorm);
  }, [formData.course_name, formData.semester, registeredSemestersForCurrentCourse]);

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
        const cId = Number(s.course_id || s.courseId || s.course?.course_id);
        if (cId) {
          setEnrolledCourseId(cId);
        }
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  };

  // Fetch Courses from API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/api/courses/all", { headers: getAuthHeaders() });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/courses", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCourseList(data);

      // Fetch lookup list of all college courses for cross-program duplicate checking
      try {
        const lookupRes = await axios.get("http://localhost:8080/api/courses/lookup", { headers: getAuthHeaders() });
        const lookupData = Array.isArray(lookupRes.data) ? lookupRes.data : (lookupRes.data?.content || []);
        if (lookupData.length > 0) {
          setAllCoursesLookup(lookupData);
        } else {
          setAllCoursesLookup(data);
        }
      } catch {
        setAllCoursesLookup(data);
      }

      // If student and backend already returns isolated course, auto-sync enrolledCourseId
      if (roleId === 4 && data.length > 0 && !enrolledCourseId) {
        const autoCId = Number(data[0].course_id || data[0].courseId || data[0].id);
        if (autoCId) setEnrolledCourseId(autoCId);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      showToast("Failed to fetch courses from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (roleId === 4) {
      fetchStudentProfile();
    }
  }, []);

  // Save / Update Course Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_name.trim()) {
      showToast("Please enter a valid course name.", "error");
      return;
    }

    if (isDuplicateSemester) {
      showToast(`Duplicate semester: "${formData.course_name.trim()}" already has ${formData.semester} registered! Please select a different semester.`, "error");
      return;
    }

    const payload = {
      ...formData,
      course_name: formData.course_name.trim(),
      course_fee: parseFloat(formData.course_fee) || 0,
      semester: formData.semester,
      credits: formData.credits ? String(formData.credits).trim() : "24 Credits",
      department: formData.department ? String(formData.department).trim() : "Academic Wing",
      course_code: formData.course_code ? String(formData.course_code).trim() : "",
      description: formData.description ? String(formData.description).trim() : ""
    };

    try {
      if (editingCourse && (editingCourse.id || editingCourse.course_id)) {
        const id = editingCourse.id || editingCourse.course_id;
        const res = await axios.put(`http://localhost:8080/api/courses/${id}`, payload, { headers: getAuthHeaders() });
        showToast("Course details updated successfully!");
        if (viewingCourse && (viewingCourse.id === id || viewingCourse.course_id === id)) {
          setViewingCourse(res.data);
        }
      } else {
        await axios.post("http://localhost:8080/api/courses", payload, { headers: getAuthHeaders() });
        showToast("New Course program registered successfully!");
      }
      setShowAddEditModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || "Operation failed. Please verify fields and permissions.";
      showToast(errMsg, "error");
    }
  };

  // Delete Course Handler
  const handleDeleteCourse = async (course) => {
    const id = course.id || course.course_id;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${course.course_name || course.courseName}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`, { headers: getAuthHeaders() });
      showToast("Course removed successfully.");
      if (viewingCourse && (viewingCourse.id === id || viewingCourse.course_id === id)) {
        setViewingCourse(null);
      }
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      showToast("Could not delete course. It may be linked to active student records.", "error");
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowAddEditModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name || course.courseName || "",
      semester: course.semester || "Semester 1",
      course_fee: course.course_fee || course.courseFee || "",
      course_code: course.course_code || course.courseCode || "",
      credits: course.credits || "24 Credits",
      department: course.department || "Academic Wing",
      description: course.description || ""
    });
    setShowAddEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      course_name: "",
      semester: "Semester 1",
      course_fee: "",
      course_code: "",
      credits: "24 Credits",
      department: "Academic Wing",
      description: ""
    });
  };

  // --- Filtering & Sorting Logic ---
  const uniqueDegreeTypes = useMemo(() => {
    const degrees = new Set();
    courseList.forEach(c => {
      const name = (c.course_name || c.courseName || "").trim();
      if (!name) return;
      const prefix = name.split(" ")[0].toUpperCase();
      degrees.add(prefix);
    });
    return Array.from(degrees);
  }, [courseList]);

  const filteredAndSortedCourses = useMemo(() => {
    return courseList
      .filter(course => {
        // Enforce student enrolled course isolation
        if (isStudent && enrolledCourseId) {
          const cId = Number(course.course_id || course.courseId || course.id);
          if (cId !== enrolledCourseId) return false;
        }

        const name = (course.course_name || course.courseName || "").toLowerCase();
        const sem = String(course.semester || "").toLowerCase();
        const code = String(course.course_code || course.courseCode || "").toLowerCase();
        const term = searchTerm.toLowerCase();

        // Search match
        const matchesSearch = name.includes(term) || sem.includes(term) || code.includes(term);

        // Semester filter
        const matchesSem = selectedSemFilter === "ALL" || sem.includes(selectedSemFilter.toLowerCase());

        // Degree filter
        const matchesDegree = selectedDegreeFilter === "ALL" || name.startsWith(selectedDegreeFilter.toLowerCase());

        return matchesSearch && matchesSem && matchesDegree;
      })
      .sort((a, b) => {
        const nameA = (a.course_name || a.courseName || "").toLowerCase();
        const nameB = (b.course_name || b.courseName || "").toLowerCase();
        const feeA = Number(a.course_fee || a.courseFee || 0);
        const feeB = Number(b.course_fee || b.courseFee || 0);

        if (sortBy === "name_asc") return nameA.localeCompare(nameB);
        if (sortBy === "name_desc") return nameB.localeCompare(nameA);
        if (sortBy === "fee_low") return feeA - feeB;
        if (sortBy === "fee_high") return feeB - feeA;
        return 0;
      });
  }, [courseList, searchTerm, selectedSemFilter, selectedDegreeFilter, sortBy, isStudent, enrolledCourseId]);

  // Dynamic Metrics
  const enrolledCourse = courseList.find(c => Number(c.course_id || c.courseId || c.id) === enrolledCourseId) || (isStudent && courseList.length > 0 ? courseList[0] : null);
  const totalCourses = isStudent ? (enrolledCourse ? 1 : 0) : courseList.length;
  const avgFee = isStudent
    ? (enrolledCourse ? Number(enrolledCourse.course_fee || enrolledCourse.courseFee || 0) : 0)
    : (totalCourses > 0 ? Math.round(courseList.reduce((acc, c) => acc + Number(c.course_fee || c.courseFee || 0), 0) / totalCourses) : 0);

  // --- Theme Styles ---
  const theme = {
    bg: darkMode ? "#0b0f19" : "#f4f7fb",
    cardBg: darkMode ? "#151e2e" : "#ffffff",
    cardHover: darkMode ? "#1c2638" : "#f8fafc",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#293548" : "#cbd5e1",
    primaryGrad: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    successGrad: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    accent: "#0284c7",
    shadow: darkMode ? "0 10px 30px rgba(0, 0, 0, 0.4)" : "0 8px 25px rgba(0, 0, 0, 0.04)"
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%", background: theme.bg,
      padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center",
      boxSizing: "border-box", fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-card, #printable-card * { visibility: visible; }
          #printable-card {
            position: fixed; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #333 !important;
            width: 100% !important;
            max-width: 750px !important;
            background: #fff !important;
            color: #000 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

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

      <div style={{ width: "100%", maxWidth: "1250px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* 🌟 1. HERO HEADER */}
        <div style={{
          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 60%, #075985 100%)",
          borderRadius: "20px", padding: "28px 32px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px",
          boxShadow: "0 14px 34px rgba(2, 132, 199, 0.25)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.2)", padding: "14px", borderRadius: "16px",
              display: "flex", backdropFilter: "blur(8px)"
            }}>
              <FaGraduationCap size={32} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Academic Course Catalog & Syllabus
              </h1>
              <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
                Explore curriculum structures, semester fees, credit breakdowns, and program details.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {canManageCourse && (
              <button
                onClick={openAddModal}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", background: "#ffffff",
                  color: "#0284c7", padding: "12px 20px", borderRadius: "12px", border: "none",
                  fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                  transition: "transform 0.15s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <FaPlus /> Add New Program
              </button>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)", color: "#ffffff", padding: "12px 20px",
                borderRadius: "12px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
              }}
            >
              <FaArrowLeft /> Dashboard
            </button>
          </div>
        </div>

        {/* 🎓 ENROLLED DEGREE BANNER (For Students) */}
        {isStudent && (
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            border: "2px solid #3b82f6",
            borderRadius: "20px",
            padding: "24px 28px",
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
                <FaGraduationCap size={34} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>
                    {enrolledCourse?.course_name || enrolledCourse?.courseName || "Your Enrolled Course"}
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
                    ✓ Your Enrolled Program
                  </span>
                  {(enrolledCourse?.course_id || enrolledCourse?.courseId || enrolledCourseId) && (
                    <span style={{
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#a5b4fc",
                      padding: "4px 10px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>
                      Course ID #{enrolledCourse?.course_id || enrolledCourse?.courseId || enrolledCourseId}
                    </span>
                  )}
                </div>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                  Student: <strong style={{ color: "#f8fafc" }}>{studentProfile?.student_name || user?.full_name || "Student"}</strong> (ID #{studentProfile?.student_id || user?.user_id}) • Displaying only your degree program, semester fees, and syllabus curriculum.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/subject")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                padding: "14px 24px",
                borderRadius: "14px",
                border: "none",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)",
                transition: "transform 0.15s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <FaBook /> View My Subjects Syllabus
            </button>
          </div>
        )}

        {/* 👨‍🏫 PROFESSOR BANNER (Faculty Assigned Program) */}
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
                    Faculty Assigned Department Program
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
                    👁 Faculty View-Only
                  </span>
                </div>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                  Faculty: <strong style={{ color: "#f8fafc" }}>{user?.full_name || user?.name || "Professor"}</strong> • Displaying your assigned academic department curriculum. Course additions, fee modifications & structural edits are restricted to HOD & Principal.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/subject")}
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
              <FaBook /> View Department Subjects
            </button>
          </div>
        )}

        {/* 👔 HOD BANNER (Department Academic Management) */}
        {isHOD && (
          <div style={{
            background: "linear-gradient(135deg, #312e81 0%, #0f172a 100%)",
            border: "2px solid #6366f1",
            borderRadius: "20px",
            padding: "22px 28px",
            boxShadow: "0 12px 30px rgba(99, 102, 241, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(99, 102, 241, 0.2)",
                padding: "16px",
                borderRadius: "16px",
                color: "#a5b4fc",
                display: "flex"
              }}>
                <FaAward size={32} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#ffffff" }}>
                    Department Academic Management
                  </h2>
                  <span style={{
                    background: "rgba(99, 102, 241, 0.25)",
                    color: "#c7d2fe",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "800"
                  }}>
                    👔 Department Head (HOD)
                  </span>
                </div>
                <p style={{ margin: "6px 0 0 0", color: "#94a3b8", fontSize: "14px" }}>
                  Head of Department: <strong style={{ color: "#f8fafc" }}>{user?.full_name || user?.name || "HOD"}</strong> • Managing curriculum, fees, and syllabus for your departmental programs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 2. METRICS STATS BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(2, 132, 199, 0.12)", color: "#0284c7", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaBook />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>
                {isStudent ? "Enrolled Course" : isProfessor ? (totalCourses > 1 ? "Assigned Programs" : "Assigned Program") : isHOD ? "Dept Programs" : "Total Courses"}
              </span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: theme.textPrimary }}>
                {isStudent ? (enrolledCourse?.course_name || "1 Enrolled Program") : isProfessor ? (totalCourses > 1 ? `${totalCourses} Programs` : (courseList[0]?.course_name || `${totalCourses} Program`)) : `${totalCourses} Programs`}
              </div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaMoneyBillWave />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>
                {isStudent ? "My Semester Fee" : isProfessor ? "Program Sem Fee" : "Average Sem Fee"}
              </span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: "#10b981" }}>
                ₹{avgFee.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8b5cf6", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaUniversity />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>
                {isStudent ? "Enrolled Semester" : isProfessor ? (totalCourses > 1 ? "Curriculum Semesters" : "Curriculum Semester") : "Disciplines / Wings"}
              </span>
              <div style={{ fontSize: "22px", fontWeight: "900", color: theme.textPrimary }}>
                {isStudent ? (enrolledCourse?.semester || "Semester 2") : isProfessor ? (totalCourses > 1 ? `${totalCourses} Active Semesters` : (courseList[0]?.semester || "Semester")) : `${uniqueDegreeTypes.length || 1} Streams`}
              </div>
            </div>
          </div>

          <div style={{
            background: theme.cardBg, padding: "20px", borderRadius: "16px",
            border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow, display: "flex", alignItems: "center", gap: "14px"
          }}>
            <div style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b", padding: "14px", borderRadius: "12px", fontSize: "20px" }}>
              <FaAward />
            </div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Academic Status</span>
              <div style={{ fontSize: "18px", fontWeight: "900", color: "#f59e0b" }}>
                {isStudent ? "Active Student Record" : isProfessor ? "Faculty View-Only" : isHOD ? "Department Admin" : "AICTE / UGC Sync"}
              </div>
            </div>
          </div>

        </div>

        {/* 🔍 3. ADVANCED SEARCH, FILTER & TOOLBAR */}
        <div style={{
          background: theme.cardBg, borderRadius: "18px", padding: "22px 26px",
          border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow,
          display: "flex", flexDirection: "column", gap: "16px"
        }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>

            {/* Search Input */}
            <div style={{
              flex: "1 1 320px", display: "flex", alignItems: "center", gap: "10px",
              background: theme.inputBg, border: `1.5px solid ${theme.inputBorder}`,
              padding: "12px 18px", borderRadius: "12px"
            }}>
              <FaSearch color={theme.accent} size={16} />
              <input
                type="text"
                placeholder="Search course title (e.g. B.Tech CSE, BCA, MBA), semester or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Quick Filters & Sorting Controls */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>

              {/* Semester Select */}
              <select
                value={selectedSemFilter}
                onChange={(e) => setSelectedSemFilter(e.target.value)}
                style={{
                  padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                  background: theme.inputBg, color: theme.textPrimary, fontSize: "13px", fontWeight: "700",
                  outline: "none", cursor: "pointer"
                }}
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>

              {/* Sort By Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                  background: theme.inputBg, color: theme.textPrimary, fontSize: "13px", fontWeight: "700",
                  outline: "none", cursor: "pointer"
                }}
              >
                <option value="name_asc">Alphabetical (A - Z)</option>
                <option value="name_desc">Alphabetical (Z - A)</option>
                <option value="fee_low">Fee: Lowest First</option>
                <option value="fee_high">Fee: Highest First</option>
              </select>

              {/* Grid / List View Toggle */}
              <div style={{
                display: "flex", background: theme.inputBg, border: `1.5px solid ${theme.inputBorder}`,
                borderRadius: "12px", padding: "4px"
              }}>
                <button
                  onClick={() => setViewMode("grid")}
                  style={{
                    background: viewMode === "grid" ? theme.accent : "transparent",
                    color: viewMode === "grid" ? "#ffffff" : theme.textSecondary,
                    border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "12px"
                  }}
                >
                  <FaThLarge /> Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  style={{
                    background: viewMode === "table" ? theme.accent : "transparent",
                    color: viewMode === "table" ? "#ffffff" : theme.textSecondary,
                    border: "none", borderRadius: "8px", padding: "8px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: "12px"
                  }}
                >
                  <FaList /> Table
                </button>
              </div>

            </div>

          </div>

          {/* Quick Category Chips */}
          {uniqueDegreeTypes.length > 1 && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", paddingTop: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: theme.textSecondary }}>Discipline:</span>
              <button
                onClick={() => setSelectedDegreeFilter("ALL")}
                style={{
                  padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                  cursor: "pointer", border: "none",
                  background: selectedDegreeFilter === "ALL" ? theme.accent : theme.inputBg,
                  color: selectedDegreeFilter === "ALL" ? "#ffffff" : theme.textSecondary
                }}
              >
                All Degrees
              </button>
              {uniqueDegreeTypes.map((deg, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDegreeFilter(deg)}
                  style={{
                    padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                    cursor: "pointer", border: "none",
                    background: selectedDegreeFilter === deg ? theme.accent : theme.inputBg,
                    color: selectedDegreeFilter === deg ? "#ffffff" : theme.textSecondary
                  }}
                >
                  {deg}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* 📚 4. COURSE CONTENT DISPLAY (GRID OR TABLE) */}
        {loading ? (
          <div style={{
            background: theme.cardBg, borderRadius: "20px", padding: "60px",
            textAlign: "center", color: theme.textSecondary, border: `1px solid ${theme.cardBorder}`
          }}>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>Loading Academic Database...</div>
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          <div style={{
            background: theme.cardBg, borderRadius: "20px", padding: "60px 20px",
            textAlign: "center", border: `1px solid ${theme.cardBorder}`, color: theme.textSecondary
          }}>
            <FaBook size={44} style={{ opacity: 0.3, marginBottom: "14px" }} />
            <h3 style={{ margin: "0 0 6px 0", color: theme.textPrimary }}>No matching courses found</h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px" }}>Try tweaking your search keywords or active filters.</p>
            <button
              onClick={() => { setSearchTerm(""); setSelectedSemFilter("ALL"); setSelectedDegreeFilter("ALL"); }}
              style={{
                background: theme.accent, color: "#fff", border: "none",
                padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer"
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (

          /* GRID VIEW */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "20px"
          }}>
            {filteredAndSortedCourses.map((course, index) => {
              const name = course.course_name || course.courseName || "Untitled Course";
              const sem = course.semester || "Semester 1";
              const fee = Number(course.course_fee || course.courseFee || 0);
              const credits = course.credits || "24 Credits";

              return (
                <div
                  key={index}
                  style={{
                    background: theme.cardBg, borderRadius: "18px", padding: "24px",
                    border: `1px solid ${theme.cardBorder}`, boxShadow: theme.shadow,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    position: "relative", overflow: "hidden"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = darkMode ? "0 16px 36px rgba(0,0,0,0.5)" : "0 14px 30px rgba(2, 132, 199, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = theme.shadow;
                  }}
                >
                  {/* Card Header Badges */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                          background: "rgba(2, 132, 199, 0.12)", color: "#0284c7", textTransform: "uppercase"
                        }}>
                          {sem.includes("Semester") ? sem : `Semester ${sem}`}
                        </span>
                        {(course.course_id || course.courseId || course.id) && (
                          <span style={{
                            padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                            background: "rgba(99, 102, 241, 0.12)", color: "#6366f1"
                          }}>
                            ID #{course.course_id || course.courseId || course.id}
                          </span>
                        )}
                      </div>

                      <span style={{
                        fontSize: "11px", fontWeight: "700", color: "#10b981",
                        background: "rgba(16, 185, 129, 0.1)", padding: "4px 10px", borderRadius: "8px"
                      }}>
                        ● Active
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "800", color: theme.textPrimary }}>
                      {name}
                    </h3>

                    <p style={{ margin: 0, fontSize: "12px", color: theme.textSecondary, display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaUniversity size={12} /> {course.department || "Academic Curriculum"}
                    </p>
                  </div>

                  {/* Fee & Specs Strip */}
                  <div style={{
                    margin: "18px 0", padding: "14px", borderRadius: "12px",
                    background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Semester Fee</span>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: "#10b981" }}>
                        ₹{fee.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary, textTransform: "uppercase" }}>Workload</span>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: theme.textPrimary }}>
                        {credits}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => setViewingCourse(course)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        padding: "10px 14px", borderRadius: "10px", border: "none",
                        background: "rgba(2, 132, 199, 0.12)", color: "#0284c7", fontWeight: "800",
                        fontSize: "13px", cursor: "pointer"
                      }}
                    >
                      <FaEye /> View Details
                    </button>

                    {isStudent && (
                      <button
                        onClick={() => navigate('/subject')}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          padding: "10px 14px", borderRadius: "10px", border: "none",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#ffffff", fontWeight: "800",
                          fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                        }}
                      >
                        <FaBook /> View Syllabus
                      </button>
                    )}

                    {canManageCourse && (
                      <>
                        <button
                          onClick={() => openEditModal(course)}
                          title="Edit Course"
                          style={{
                            padding: "10px 12px", borderRadius: "10px", border: `1px solid ${theme.inputBorder}`,
                            background: theme.cardBg, color: theme.textSecondary, cursor: "pointer", fontSize: "13px"
                          }}
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course)}
                          title="Delete Course"
                          style={{
                            padding: "10px 12px", borderRadius: "10px", border: `1px solid ${theme.inputBorder}`,
                            background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer", fontSize: "13px"
                          }}
                        >
                          <FaTrashAlt />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (

          /* TABLE VIEW (FOR RAPID SCANNING OF 50+ COURSES) */
          <div style={{
            background: theme.cardBg, borderRadius: "18px", border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.shadow, overflowX: "auto"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: theme.inputBg, borderBottom: `2px solid ${theme.cardBorder}`, color: theme.textSecondary }}>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>#</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>COURSE / DEGREE TITLE</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>SEMESTER</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>SEMESTER FEE</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800" }}>STATUS</th>
                  <th style={{ padding: "16px 20px", fontWeight: "800", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCourses.map((c, idx) => {
                  const name = c.course_name || c.courseName || "Untitled";
                  const sem = c.semester || "Semester 1";
                  const fee = Number(c.course_fee || c.courseFee || 0);

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
                      <td style={{ padding: "16px 20px", color: theme.textSecondary, fontWeight: "700" }}>{idx + 1}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: "800", color: theme.textPrimary }}>{name}</div>
                        {(c.course_id || c.courseId || c.id) && (
                          <span style={{
                            display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: "700",
                            background: "rgba(99, 102, 241, 0.12)", color: "#6366f1",
                            padding: "2px 8px", borderRadius: "6px"
                          }}>
                            ID #{c.course_id || c.courseId || c.id}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", color: theme.textSecondary, fontWeight: "600" }}>
                        <span style={{ background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                          {sem}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: "800", color: "#10b981" }}>
                        ₹{fee.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981" }}>● Active</span>
                      </td>
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={() => setViewingCourse(c)}
                            style={{
                              padding: "6px 12px", borderRadius: "8px", border: "none",
                              background: theme.accent, color: "#fff", fontWeight: "700", fontSize: "12px",
                              cursor: "pointer"
                            }}
                          >
                            View
                          </button>
                          {isStudent && (
                            <button
                              onClick={() => navigate('/subject')}
                              style={{
                                padding: "6px 12px", borderRadius: "8px", border: "none",
                                background: "#10b981", color: "#fff", fontWeight: "700", fontSize: "12px",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                              }}
                            >
                              <FaBook size={10} /> Syllabus
                            </button>
                          )}
                          {canManageCourse && (
                            <>
                              <button
                                onClick={() => openEditModal(c)}
                                style={{
                                  padding: "6px 10px", borderRadius: "8px", border: `1px solid ${theme.inputBorder}`,
                                  background: theme.cardBg, color: theme.textSecondary, cursor: "pointer", fontSize: "12px"
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(c)}
                                style={{
                                  padding: "6px 10px", borderRadius: "8px", border: "none",
                                  background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer", fontSize: "12px"
                                }}
                              >
                                <FaTrashAlt />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 📄 5. DETAILED COURSE INSPECTOR MODAL (FOR INDIVIDUAL VIEW & PRINT) */}
      {viewingCourse && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
        }}>
          <div
            id="printable-card"
            style={{
              background: theme.cardBg, borderRadius: "24px", padding: "34px", maxWidth: "680px", width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${theme.cardBorder}`,
              display: "flex", flexDirection: "column", gap: "20px"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{
                  padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                  background: "rgba(2, 132, 199, 0.15)", color: "#0284c7", textTransform: "uppercase"
                }}>
                  ACADEMIC SPECIFICATION SHEET
                </span>
                <h2 style={{ margin: "10px 0 4px 0", fontSize: "24px", fontWeight: "900", color: theme.textPrimary }}>
                  {viewingCourse.course_name || viewingCourse.courseName}
                </h2>
                <div style={{ fontSize: "13px", color: theme.textSecondary, fontWeight: "600" }}>
                  Term: {viewingCourse.semester || "Semester 1"} • {viewingCourse.department || "Autonomous Program"}
                </div>
              </div>

              <button
                onClick={() => setViewingCourse(null)}
                className="no-print"
                style={{
                  background: theme.inputBg, border: `1px solid ${theme.inputBorder}`,
                  color: theme.textSecondary, cursor: "pointer", width: "36px", height: "36px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Fee Highlight Card */}
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: "16px", padding: "20px 24px", color: "#ffffff",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "700", opacity: 0.9, textTransform: "uppercase" }}>
                  Semester Tuition & Lab Fee
                </span>
                <div style={{ fontSize: "30px", fontWeight: "900", marginTop: "2px" }}>
                  ₹{Number(viewingCourse.course_fee || viewingCourse.courseFee || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: "right", opacity: 0.9, fontSize: "12px", fontWeight: "600" }}>
                <div>✓ 100% Online Payment Ready</div>
                <div>✓ Receipt Generated Instantly</div>
              </div>
            </div>

            {/* Program Details 4-Box Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px" }}>
              <div style={{ background: theme.inputBg, padding: "14px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}` }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary }}>STATUS</span>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>● Active</div>
                <span style={{ fontSize: "11px", color: theme.textSecondary }}>Admissions Open</span>
              </div>

              <div style={{ background: theme.inputBg, padding: "14px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}` }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary }}>DURATION</span>
                <div style={{ fontSize: "15px", fontWeight: "800", color: theme.textPrimary, marginTop: "4px" }}>6 Months / Sem</div>
                <span style={{ fontSize: "11px", color: theme.textSecondary }}>Regular Full-time</span>
              </div>

              <div style={{ background: theme.inputBg, padding: "14px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}` }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary }}>CREDITS</span>
                <div style={{ fontSize: "15px", fontWeight: "800", color: theme.accent, marginTop: "4px" }}>
                  {viewingCourse.credits || "24 Credits"}
                </div>
                <span style={{ fontSize: "11px", color: theme.textSecondary }}>Academic Credits</span>
              </div>

              <div style={{ background: theme.inputBg, padding: "14px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}` }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: theme.textSecondary }}>DEPARTMENT</span>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#6366f1", marginTop: "4px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {viewingCourse.department || "Academic Wing"}
                </div>
                <span style={{ fontSize: "11px", color: theme.textSecondary }}>Faculty Division</span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", borderTop: `1px solid ${theme.cardBorder}`, paddingTop: "16px" }}>
              <div>
                {canManageCourse && (
                  <button
                    onClick={() => {
                      const c = viewingCourse;
                      setViewingCourse(null);
                      openEditModal(c);
                    }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "transparent", border: `1.5px solid ${theme.accent}`, color: theme.accent,
                      padding: "10px 18px", borderRadius: "10px", fontWeight: "800", cursor: "pointer"
                    }}
                  >
                    <FaEdit /> Edit Program
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px",
                    background: theme.primaryGrad, color: "white", border: "none",
                    borderRadius: "10px", fontWeight: "800", cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(2, 132, 199, 0.35)"
                  }}
                >
                  <FaPrint /> Print / Export PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ✏️ 6. ADD / EDIT COURSE MODAL (FOR HOD & PRINCIPAL) */}
      {showAddEditModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
        }}>
          <div style={{
            background: theme.cardBg, borderRadius: "24px", padding: "32px", maxWidth: "560px", width: "100%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${theme.cardBorder}`
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(2, 132, 199, 0.15)", color: theme.accent, padding: "10px", borderRadius: "12px" }}>
                  <FaGraduationCap size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: theme.textPrimary }}>
                  {editingCourse ? "Edit Degree Program" : "Register New Degree Program"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                style={{ background: "none", border: "none", color: theme.textSecondary, cursor: "pointer", fontSize: "18px" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>
                  PROGRAM / COURSE TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Computer Science & Engg, BCA, MBA"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  style={{
                    padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                    background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                  }}
                />
                {registeredSemestersForCurrentCourse.length > 0 && (
                  <div style={{
                    fontSize: "12px",
                    color: "#60a5fa",
                    background: "rgba(59, 130, 246, 0.08)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FaInfoCircle size={12} />
                    <span>Existing semesters registered for <strong>{formData.course_name.trim()}</strong>: {registeredSemestersForCurrentCourse.join(", ")}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>SEMESTER *</label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    style={{
                      padding: "12px 16px", borderRadius: "12px",
                      border: isDuplicateSemester ? "1.5px solid #ef4444" : `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  >
                    {[
                      "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5",
                      "Semester 6", "Semester 7", "Semester 8", "Semester 9", "Semester 10"
                    ].map((sem) => {
                      const isTaken = registeredSemestersForCurrentCourse.some(
                        (s) => normalizeSemester(s) === normalizeSemester(sem)
                      );
                      return (
                        <option key={sem} value={sem}>
                          {sem} {isTaken ? "⚠️ (Already Registered)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>SEMESTER FEE (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45000"
                    value={formData.course_fee}
                    onChange={(e) => setFormData({ ...formData, course_fee: e.target.value })}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                </div>

              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>CREDITS</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 Credits"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: theme.textSecondary }}>DEPARTMENT</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering / Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${theme.inputBorder}`,
                      background: theme.inputBg, color: theme.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600"
                    }}
                  />
                </div>
              </div>

              {/* ⚠️ Warning Banner if combination of Course Name + Semester already exists */}
              {isDuplicateSemester && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: "700"
                }}>
                  <FaTimes style={{ flexShrink: 0 }} />
                  <div>
                    <div>Duplicate Semester: <strong>"{formData.course_name.trim()}"</strong> already has <strong>{formData.semester}</strong> registered!</div>
                    <div style={{ fontSize: "11px", fontWeight: "500", color: "#fca5a5", marginTop: "2px" }}>
                      You can add <strong>"{formData.course_name.trim()}"</strong> for other semesters, but each semester can only be added once. Please select an unregistered semester.
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  style={{
                    padding: "12px 20px", borderRadius: "12px", border: `1px solid ${theme.inputBorder}`,
                    background: "none", color: theme.textSecondary, fontWeight: "700", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isDuplicateSemester}
                  title={isDuplicateSemester ? "Please select a different semester before saving" : ""}
                  style={{
                    padding: "12px 28px", borderRadius: "12px", border: "none",
                    background: isDuplicateSemester ? "#64748b" : theme.primaryGrad,
                    color: "white", fontWeight: "800",
                    cursor: isDuplicateSemester ? "not-allowed" : "pointer",
                    opacity: isDuplicateSemester ? 0.6 : 1,
                    boxShadow: isDuplicateSemester ? "none" : "0 6px 18px rgba(2, 132, 199, 0.4)"
                  }}
                >
                  {editingCourse ? "Update Program" : "Save & Publish Program"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Course;