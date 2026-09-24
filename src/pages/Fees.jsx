import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaGraduationCap, FaGift,
  FaPercent, FaMoneyBillWave, FaArrowLeft, FaSave,
  FaSearch, FaCheckCircle, FaClock, FaExclamationCircle,
  FaCreditCard, FaFileInvoiceDollar, FaHashtag, FaIdCard,
  FaReceipt, FaFilter, FaCalendarAlt, FaInfoCircle
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Fees() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // RBAC Control: Student (4), Professor (3), HOD (1) = View only, Principal (2) = Full Access (Add/Edit)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const currentUserId = user?.user_id || user?.userId || user?.id;
  const isStudent = roleId === 4;
  const isProfessor = roleId === 3;
  const isHOD = roleId === 1;

  // Sirf Principal (roleId === 2) add/edit kar sakega, baaki sab view-only
  const isViewOnly = isStudent || isProfessor || isHOD;

  const [feesList, setFeesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [currentStudentProfile, setCurrentStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseHoverData, setCourseHoverData] = useState({});
  const [hoveredCourseId, setHoveredCourseId] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoverLoading, setHoverLoading] = useState(false);

  const [fees, setFees] = useState({
    courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchContextData = async () => {
    const headers = getAuthHeaders();

    // 1. Fetch Students
    try {
      let sRes;
      try {
        sRes = await axios.get("http://localhost:8080/student/all", { headers });
      } catch {
        sRes = await axios.get("http://localhost:8080/api/student", { headers });
      }
      const sData = Array.isArray(sRes?.data) ? sRes.data : (sRes?.data?.content || []);
      setStudentsList(sData);

      // Auto-detect logged-in student profile
      if (isStudent && sData.length > 0) {
        const uEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
        const uName = (user?.fullName || user?.full_name || "").toLowerCase().trim();
        const uMobile = (user?.mobile_no || user?.mobileNo || "").trim();

        const matched = sData.find(s => {
          const sEmail = (s.email || "").toLowerCase().trim();
          const sUserId = s.user_id != null ? Number(s.user_id) : null;
          const sMobile = (s.mobile_no || "").trim();
          const sName = (s.student_name || "").toLowerCase().trim();

          return (uEmail && sEmail === uEmail) ||
                 (sUserId && currentUserId && sUserId === Number(currentUserId)) ||
                 (uMobile && sMobile === uMobile) ||
                 (uName && sName === uName);
        });

        if (matched) {
          setCurrentStudentProfile(matched);
        } else {
          setCurrentStudentProfile(sData[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }

    // 2. Fetch Courses
    try {
      let cRes;
      try {
        cRes = await axios.get("http://localhost:8080/api/courses/lookup", { headers });
      } catch {
        try {
          cRes = await axios.get("http://localhost:8080/api/courses/all", { headers });
        } catch {
          cRes = await axios.get("http://localhost:8080/api/courses", { headers });
        }
      }
      const cData = Array.isArray(cRes?.data) ? cRes.data : (cRes?.data?.content || []);
      setCoursesList(cData);

      // Pre-seed course details cache from fetched database list
      const initialCache = {};
      cData.forEach(c => {
        const id = c.course_id || c.courseId || c.id;
        if (id != null) {
          initialCache[id] = {
            id,
            name: c.course_name || c.courseName || `Course #${id}`,
            semester: c.semester || c.sem || "N/A",
            fee: Number(c.course_fee || c.courseFee || 0),
            isLiveDb: true
          };
        }
      });
      setCourseHoverData(prev => ({ ...initialCache, ...prev }));
    } catch (err) {
      console.error("Error fetching courses:", err);
    }

    // 3. Fetch Payments to link Real-time Paid & Pending amounts
    try {
      let pRes;
      try {
        pRes = await axios.get("http://localhost:8080/api/payments", { headers });
      } catch {
        pRes = await axios.get("http://localhost:8080/payment/all", { headers });
      }
      const pData = Array.isArray(pRes?.data) ? pRes.data : (pRes?.data?.content || []);
      setPaymentsList(pData);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // Live Database Fetch on Cursor Hover over Course
  const handleCourseMouseEnter = async (cId, rowIndex) => {
    if (!cId) return;
    setHoveredCourseId(cId);
    setHoveredRowIndex(rowIndex);

    // If data not loaded yet or semester is missing, fetch fresh live record from DB endpoint
    if (!courseHoverData[cId] || courseHoverData[cId].semester === "N/A" || !courseHoverData[cId].semester) {
      setHoverLoading(true);
      try {
        const headers = getAuthHeaders();
        const res = await axios.get(`http://localhost:8080/api/courses/${cId}`, { headers });
        if (res?.data) {
          setCourseHoverData(prev => ({
            ...prev,
            [cId]: {
              id: res.data.course_id || res.data.courseId || cId,
              name: res.data.course_name || res.data.courseName || `Course #${cId}`,
              semester: res.data.semester || "N/A",
              fee: Number(res.data.course_fee || res.data.courseFee || 0),
              isLiveDb: true
            }
          }));
        }
      } catch (err) {
        console.warn(`Hover DB fetch failed for course ${cId}:`, err);
        // Fallback to coursesList if available
        const fallback = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(cId));
        if (fallback) {
          setCourseHoverData(prev => ({
            ...prev,
            [cId]: {
              id: fallback.course_id || fallback.courseId || fallback.id || cId,
              name: fallback.course_name || fallback.courseName || `Course #${cId}`,
              semester: fallback.semester || fallback.sem || "N/A",
              fee: Number(fallback.course_fee || fallback.courseFee || 0),
              isLiveDb: false
            }
          }));
        }
      } finally {
        setHoverLoading(false);
      }
    }
  };

  const handleCourseMouseLeave = () => {
    setHoveredCourseId(null);
    setHoveredRowIndex(null);
  };

  const getStudentInfo = (sId) => {
    if (!sId) return { name: "-", roll: "-", id: "-", courseId: null };
    const s = studentsList.find(item => Number(item.student_id || item.studentId || item.id) === Number(sId));
    if (s) {
      return {
        name: s.student_name || s.studentName || `Student #${sId}`,
        roll: s.roll_no || s.rollNo || "-",
        id: s.student_id || s.studentId || sId,
        email: s.email || "-",
        mobile: s.mobile_no || "-",
        courseId: s.course_id || s.courseId || s.course?.course_id || null
      };
    }
    return { name: `Student #${sId}`, roll: "-", id: sId, courseId: null };
  };

  const getCourseInfo = (cId) => {
    if (!cId) return { id: "-", name: "-", fee: 0, semester: "N/A" };
    if (courseHoverData[cId]) {
      return courseHoverData[cId];
    }
    const c = coursesList.find(item => Number(item.course_id || item.courseId || item.id) === Number(cId));
    if (c) {
      return {
        id: c.course_id || c.courseId || c.id || cId,
        name: c.course_name || c.courseName || `Course #${cId}`,
        fee: Number(c.course_fee || c.courseFee || 0),
        semester: c.semester || c.sem || "N/A",
        isLiveDb: true
      };
    }
    return { id: cId, name: `Course #${cId}`, fee: 0, semester: "N/A" };
  };

  // Helper to compute paid amount, pending due, and status for each fee record
  const getFeeFinancials = (item) => {
    const feeId = Number(item.feeId || item.fee_id || 0);
    const sId = Number(item.studentId || item.student_id || 0);
    const totalFees = Number(item.totalFees || item.total_fees || 0);

    const relevantPayments = paymentsList.filter(p => {
      const pFeeId = Number(p.feeId || p.fee_id || 0);
      const pStudentId = Number(p.studentId || p.student_id || 0);
      const isPaid = !p.status || p.status.toLowerCase() === "paid" || p.status.toLowerCase() === "success";

      if (pFeeId && feeId && pFeeId === feeId) return isPaid;
      if (pStudentId && sId && pStudentId === sId && (!pFeeId || pFeeId === 0)) return isPaid;
      return false;
    });

    let paidAmount = relevantPayments.reduce((acc, curr) => acc + Number(curr.paidAmount || curr.paid_amount || 0), 0);

    // Fallback: If paymentsList is empty or still fetching, use backend pre-computed paid_amount
    if (paidAmount === 0 && (item.paid_amount || item.paidAmount)) {
      paidAmount = Number(item.paid_amount || item.paidAmount || 0);
    }

    const pendingDue = Math.max(0, totalFees - paidAmount);

    let status = "Pending";
    if (totalFees > 0 && paidAmount >= totalFees) {
      status = "Paid";
    } else if (paidAmount > 0) {
      status = "Partial";
    } else {
      status = "Pending";
    }

    return { paidAmount, pendingDue, status, totalFees };
  };

  const fetchFeesList = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/fees/all", {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/fees", {
          headers: getAuthHeaders(),
        });
      }
      const allFees = Array.isArray(res.data) ? res.data : (res.data?.content || []);

      if (isStudent) {
        // Collect all IDs belonging to the logged-in student
        const validStudentIds = new Set();
        let detectedEnrolledCourseId = null;
        if (currentUserId) {
          validStudentIds.add(Number(currentUserId));
        }

        try {
          let sRes;
          try {
            sRes = await axios.get("http://localhost:8080/student/all", { headers: getAuthHeaders() });
          } catch (e) {
            sRes = await axios.get("http://localhost:8080/api/student", { headers: getAuthHeaders() });
          }
          const sList = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []);
          const uEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
          const uName = (user?.fullName || user?.full_name || "").toLowerCase().trim();
          const uMobile = (user?.mobile_no || user?.mobileNo || "").trim();

          sList.forEach(s => {
            const sEmail = (s.email || "").toLowerCase().trim();
            const sName = (s.student_name || "").toLowerCase().trim();
            const sMobile = (s.mobile_no || "").trim();
            const sUserId = s.user_id != null ? Number(s.user_id) : null;

            const isMatch = (uEmail && sEmail === uEmail) ||
                            (sUserId && currentUserId && sUserId === Number(currentUserId)) ||
                            (uMobile && sMobile === uMobile) ||
                            (uName && sName === uName);

            if (isMatch) {
              if (s.student_id != null) validStudentIds.add(Number(s.student_id));
              if (s.studentId != null) validStudentIds.add(Number(s.studentId));
              if (s.user_id != null) validStudentIds.add(Number(s.user_id));
              if (s.course_id != null) detectedEnrolledCourseId = Number(s.course_id);
              if (s.courseId != null) detectedEnrolledCourseId = Number(s.courseId);
            }
          });
        } catch (sErr) {
          console.error("Error detecting student profile:", sErr);
        }

        // Filter strictly by student IDs AND student's enrolled course
        const myFees = allFees.filter(f => {
          const fStudentId = Number(f.studentId || f.student_id);
          const fCourseId = Number(f.courseId || f.course_id);
          const isMyStudent = validStudentIds.has(fStudentId);
          const isMyCourse = detectedEnrolledCourseId ? fCourseId === detectedEnrolledCourseId : true;
          return isMyStudent && isMyCourse;
        });

        // Set ONLY this student's fee records for their enrolled course
        setFeesList(myFees);
      } else {
        // Principal, HOD, Professor see the complete directory
        setFeesList(allFees);
      }
    } catch (err) {
      console.error("Error fetching fees list:", err);
      setFeesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesList();
    fetchContextData();
  }, []);

  // Filtered fee records based on search and status
  const filteredFees = useMemo(() => {
    return feesList.filter(item => {
      const sId = item.studentId || item.student_id;
      const cId = item.courseId || item.course_id;
      const sInfo = getStudentInfo(sId);
      const cInfo = getCourseInfo(cId);
      const financials = getFeeFinancials(item);

      // Search match
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        String(sId).includes(term) ||
        String(item.feeId || item.fee_id).includes(term) ||
        sInfo.name.toLowerCase().includes(term) ||
        sInfo.roll.toLowerCase().includes(term) ||
        cInfo.name.toLowerCase().includes(term);

      // Status match
      const matchesStatus = statusFilter === "All" || financials.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [feesList, studentsList, coursesList, paymentsList, searchTerm, statusFilter]);

  // Financial KPI totals
  const kpiStats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    feesList.forEach(item => {
      const { paidAmount, pendingDue, status, totalFees } = getFeeFinancials(item);
      totalBilled += totalFees;
      totalPaid += paidAmount;
      totalDue += pendingDue;

      if (status === "Paid") paidCount++;
      else if (status === "Partial") partialCount++;
      else pendingCount++;
    });

    return { totalBilled, totalPaid, totalDue, paidCount, partialCount, pendingCount, totalRecords: feesList.length };
  }, [feesList, paymentsList]);

  // Helpers for Student Enrolled Course Detection & Mismatch Checking
  const selectedStudentObj = useMemo(() => {
    if (!fees.studentId) return null;
    return studentsList.find(s => Number(s.student_id || s.studentId || s.id) === Number(fees.studentId));
  }, [fees.studentId, studentsList]);

  const studentEnrolledCourseId = useMemo(() => {
    if (!selectedStudentObj) return null;
    return selectedStudentObj.course_id || selectedStudentObj.courseId || selectedStudentObj.course?.course_id || null;
  }, [selectedStudentObj]);

  const isCourseMismatched = useMemo(() => {
    if (!fees.studentId || !fees.courseId || !studentEnrolledCourseId) return false;
    return Number(fees.courseId) !== Number(studentEnrolledCourseId);
  }, [fees.studentId, fees.courseId, studentEnrolledCourseId]);

  const handleChange = async (e) => {
    if (isViewOnly) return;
    const { name, value } = e.target;
    let updatedFees = { ...fees, [name]: value };

    // When Principal selects a student: Auto-detect & auto-populate their enrolled course!
    if (name === "studentId" && value) {
      const foundStudent = studentsList.find(s => Number(s.student_id || s.studentId || s.id) === Number(value));
      const enrolledCId = foundStudent ? (foundStudent.course_id || foundStudent.courseId || foundStudent.course?.course_id) : "";
      if (enrolledCId) {
        updatedFees.courseId = String(enrolledCId);
        try {
          const response = await axios.get(`http://localhost:8080/api/courses/${enrolledCId}`, {
            headers: getAuthHeaders()
          });
          const courseFee = response.data.course_fee || response.data.courseFee || 0;
          let scholarship = Number(updatedFees.scholarship) || 0;
          let discount = Number(updatedFees.discountPercentage) || 0;
          let total = courseFee - scholarship;
          total = total - ((total * discount) / 100);
          updatedFees.totalFees = total > 0 ? total.toFixed(2) : "0.00";
        } catch (error) {
          console.warn("Could not fetch enrolled course fee:", error);
        }
      }
    }

    if (["courseId", "scholarship", "discountPercentage"].includes(name) && updatedFees.courseId !== "") {
      try {
        const response = await axios.get(`http://localhost:8080/api/courses/${updatedFees.courseId}`, {
          headers: getAuthHeaders()
        });
        const courseFee = response.data.course_fee || response.data.courseFee || 0;
        let scholarship = Number(updatedFees.scholarship) || 0;
        let discount = Number(updatedFees.discountPercentage) || 0;
        let total = courseFee - scholarship;
        total = total - ((total * discount) / 100);
        updatedFees.totalFees = total > 0 ? total.toFixed(2) : "0.00";
      } catch (error) {
        console.log(error);
      }
    }
    setFees(updatedFees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    if (isCourseMismatched) {
      const stdName = getStudentInfo(fees.studentId).name;
      const enrolledCourse = getCourseInfo(studentEnrolledCourseId).name;
      const selectedCourse = getCourseInfo(fees.courseId).name;
      alert(`⚠️ Course Mismatch Warning!\n\nStudent "${stdName}" is enrolled in "${enrolledCourse}" (Course #${studentEnrolledCourseId}).\n\nYou have selected "${selectedCourse}" (Course #${fees.courseId}).\n\nA student can only be billed for their own enrolled course. Please select their enrolled course.`);
      return;
    }

    try {
      try {
        await axios.post("http://localhost:8080/fees/add", fees, {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        await axios.post("http://localhost:8080/api/fees", fees, {
          headers: getAuthHeaders(),
        });
      }
      alert("Fees Saved Successfully");
      setFees({ courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "" });
      fetchFeesList();
    } catch (error) {
      const errDetail = error.response?.data?.message || error.response?.data || "Failed To Save Fees";
      alert(typeof errDetail === "string" ? errDetail : "Failed To Save Fees");
    }
  };

  const themeStyles = {
    pageBg: darkMode
      ? "radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 40%, #020617 100%)"
      : "radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 40%, #f1f5f9 100%)",
    cardBg: darkMode ? "rgba(30, 41, 59, 0.85)" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 50px rgba(0, 0, 0, 0.5)" : "0 15px 35px rgba(0, 0, 0, 0.06)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    tableHeaderBg: darkMode ? "#0f172a" : "#f1f5f9",
    iconColor: "#6366f1"
  };

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, readOnly = false, isFullWidth = false) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: isFullWidth ? "span 2" : "span 1" }}>
        <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute",
            left: "14px",
            color: readOnly ? "#10b981" : themeStyles.iconColor,
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
            value={fees[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            step="0.01"
            autoComplete="off"
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              borderRadius: "12px",
              border: `2px solid ${readOnly ? (darkMode ? "#059669" : "#10b981") : themeStyles.inputBorder}`,
              background: readOnly ? (darkMode ? "#064e3b" : "#ecfdf5") : themeStyles.inputBg,
              color: readOnly ? (darkMode ? "#a7f3d0" : "#065f46") : themeStyles.textPrimary,
              fontSize: readOnly ? "16px" : "14px",
              fontWeight: readOnly ? "700" : "500",
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
      padding: "36px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1280px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Header Banner */}
        <div style={{
          background: "linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)",
          padding: "32px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "8px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center"
              }}>
                <FaFileInvoiceDollar size={24} color="#ffffff" />
              </div>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Fees Management & Invoicing
              </h2>
            </div>
            <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
              {isStudent
                ? "🎓 Student Portal • View Your Fee Vouchers, Invoices & Payment Due"
                : isViewOnly
                ? "📋 College Academic Fee Directory (View Only)"
                : "👑 Principal Portal • Manage & Generate Student Fee Invoices"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              padding: "10px 22px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#ffffff",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
          >
            <FaArrowLeft size={13} /> Back to Dashboard
          </button>
        </div>

        {/* Logged-In Student Personal Profile Banner */}
        {isStudent && (
          <div style={{
            background: darkMode
              ? "linear-gradient(135deg, rgba(79, 70, 229, 0.18) 0%, rgba(99, 102, 241, 0.08) 100%)"
              : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            borderBottom: `1px solid ${darkMode ? "rgba(99, 102, 241, 0.3)" : "#c7d2fe"}`,
            padding: "20px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                background: "#4f46e5",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center"
              }}>
                <FaIdCard size={22} />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Active Student Account
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  {currentStudentProfile?.student_name || user?.fullName || user?.full_name || "Student"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{
                background: darkMode ? "#1e293b" : "#ffffff",
                padding: "8px 14px",
                borderRadius: "10px",
                border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`,
                fontSize: "13px",
                fontWeight: "600",
                color: themeStyles.textPrimary
              }}>
                Student ID: <span style={{ color: "#4f46e5", fontWeight: "800" }}>#{currentStudentProfile?.student_id || currentUserId || "-"}</span>
              </div>

              <div style={{
                background: darkMode ? "#1e293b" : "#ffffff",
                padding: "8px 14px",
                borderRadius: "10px",
                border: `1px solid ${darkMode ? "#334155" : "#cbd5e1"}`,
                fontSize: "13px",
                fontWeight: "600",
                color: themeStyles.textPrimary
              }}>
                Roll No: <span style={{ color: "#0284c7", fontWeight: "800" }}>{currentStudentProfile?.roll_no || "-"}</span>
              </div>

              {(currentStudentProfile?.course_id || currentStudentProfile?.courseId) && (
                <div style={{
                  background: darkMode ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${darkMode ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0"}`,
                  fontSize: "13px",
                  fontWeight: "600",
                  color: darkMode ? "#a7f3d0" : "#065f46",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <FaGraduationCap size={14} color="#10b981" />
                  <span>
                    Enrolled Program: <strong>{getCourseInfo(currentStudentProfile.course_id || currentStudentProfile.courseId).name}</strong>
                    {" • "}
                    Fee: <strong>₹{Number(getCourseInfo(currentStudentProfile.course_id || currentStudentProfile.courseId).fee || 0).toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/payment')}
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                <FaCreditCard size={13} /> Pay Fees Online
              </button>
            </div>
          </div>
        )}

        {/* KPI Financial Overview Cards */}
        <div style={{
          padding: "24px 28px 12px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px"
        }}>
          {/* Total Billed */}
          <div style={{
            background: darkMode ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
            border: `1px solid ${themeStyles.cardBorder}`,
            borderRadius: "16px",
            padding: "16px 20px"
          }}>
            <span style={{ fontSize: "12px", color: themeStyles.textSecondary, fontWeight: "700", textTransform: "uppercase" }}>
              Total Billed Fees
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#3b82f6", marginTop: "4px" }}>
              ₹{kpiStats.totalBilled.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>
              Across {kpiStats.totalRecords} invoice voucher(s)
            </span>
          </div>

          {/* Total Paid */}
          <div style={{
            background: darkMode ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
            border: `1px solid ${themeStyles.cardBorder}`,
            borderRadius: "16px",
            padding: "16px 20px"
          }}>
            <span style={{ fontSize: "12px", color: themeStyles.textSecondary, fontWeight: "700", textTransform: "uppercase" }}>
              Total Paid Amount
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
              ₹{kpiStats.totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
              {kpiStats.paidCount} Fully Paid
            </span>
          </div>

          {/* Pending Due */}
          <div style={{
            background: darkMode ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
            border: `1px solid ${themeStyles.cardBorder}`,
            borderRadius: "16px",
            padding: "16px 20px"
          }}>
            <span style={{ fontSize: "12px", color: themeStyles.textSecondary, fontWeight: "700", textTransform: "uppercase" }}>
              Pending Balance / Due
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", color: kpiStats.totalDue > 0 ? "#ef4444" : "#10b981", marginTop: "4px" }}>
              ₹{kpiStats.totalDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "11px", color: kpiStats.totalDue > 0 ? "#ef4444" : "#10b981", fontWeight: "600" }}>
              {kpiStats.totalDue > 0 ? `${kpiStats.pendingCount + kpiStats.partialCount} with dues` : "All dues cleared"}
            </span>
          </div>
        </div>

        {/* Add Fee Form (Visible ONLY for Principal) */}
        {!isViewOnly && (
          <form onSubmit={handleSubmit} style={{ padding: "20px 28px", borderBottom: `1px solid ${themeStyles.cardBorder}` }}>
            <h3 style={{ marginTop: 0, marginBottom: "18px", color: themeStyles.textPrimary }}>Generate New Fee Invoice</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {/* Student Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Student (ID & Name) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {studentsList.length > 0 ? (
                  <select
                    name="studentId"
                    value={fees.studentId}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                      color: themeStyles.textPrimary, fontSize: "14px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="">-- Select Student --</option>
                    {studentsList.map(s => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.student_name || s.studentName} ({s.roll_no ? `Roll: ${s.roll_no}` : 'Student'})
                      </option>
                    ))}
                  </select>
                ) : (
                  renderInputField("Student ID", "studentId", "Enter Student ID", FaUser, "number", true)
                )}
                {fees.studentId && (
                  <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600" }}>
                    Selected: <strong>{getStudentInfo(fees.studentId).name}</strong>
                  </span>
                )}
                {fees.studentId && studentEnrolledCourseId && (
                  <div style={{
                    marginTop: "4px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    background: darkMode ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
                    border: `1px solid ${darkMode ? "rgba(16, 185, 129, 0.3)" : "#a7f3d0"}`,
                    fontSize: "11.5px",
                    color: darkMode ? "#a7f3d0" : "#065f46",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <FaCheckCircle size={12} color="#10b981" />
                    <span>
                      Enrolled Course: <strong>{getCourseInfo(studentEnrolledCourseId).name}</strong>
                      {" • "}
                      Fee: <strong>₹{Number(getCourseInfo(studentEnrolledCourseId).fee || 0).toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Course Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Course Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {coursesList.length > 0 ? (
                  <select
                    name="courseId"
                    value={fees.courseId}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid ${isCourseMismatched ? '#ef4444' : themeStyles.inputBorder}`,
                      background: isCourseMismatched ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2') : themeStyles.inputBg,
                      color: themeStyles.textPrimary, fontSize: "14px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="">-- Select Course --</option>
                    {coursesList.map(c => {
                      const cid = c.course_id || c.id;
                      const sem = c.semester || c.sem;
                      const semText = sem ? ` • ${sem.toString().toLowerCase().includes("sem") ? sem : `Sem ${sem}`}` : '';
                      const isEnrolled = studentEnrolledCourseId && Number(cid) === Number(studentEnrolledCourseId);
                      return (
                        <option key={cid} value={cid} style={{ fontWeight: isEnrolled ? "700" : "normal" }}>
                          {isEnrolled ? "⭐ [ENROLLED COURSE] " : ""}{c.course_name || c.courseName}{semText} (Fee: ₹{Number(c.course_fee || c.courseFee || 0).toLocaleString('en-IN')})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  renderInputField("Course ID", "courseId", "Enter Course ID", FaGraduationCap, "number", true)
                )}
                {fees.courseId && (
                  <span style={{ fontSize: "11px", color: isCourseMismatched ? "#ef4444" : "#6366f1", fontWeight: "600", display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                    <span>Selected: <strong>{getCourseInfo(fees.courseId).name}</strong></span>
                    <span>• Sem: <strong>{getCourseInfo(fees.courseId).semester}</strong></span>
                    <span>• Base Fee: <strong>₹{Number(getCourseInfo(fees.courseId).fee || 0).toLocaleString('en-IN')}</strong></span>
                  </span>
                )}
                {isCourseMismatched && (
                  <div style={{
                    marginTop: "8px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: darkMode ? "rgba(239, 68, 68, 0.18)" : "#fef2f2",
                    border: "1.5px solid #ef4444",
                    color: "#ef4444",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "12px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800" }}>
                      <FaExclamationCircle size={15} />
                      <span>⚠️ Course Mismatch Warning!</span>
                    </div>
                    <div>
                      Student <strong>{getStudentInfo(fees.studentId).name}</strong> is officially enrolled in <strong>{getCourseInfo(studentEnrolledCourseId).name} (Course #{studentEnrolledCourseId})</strong>.
                      <br />
                      You have selected a different course: <strong>{getCourseInfo(fees.courseId).name} (Course #{fees.courseId})</strong>.
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const enrolledCId = String(studentEnrolledCourseId);
                        let updated = { ...fees, courseId: enrolledCId };
                        try {
                          const res = await axios.get(`http://localhost:8080/api/courses/${enrolledCId}`, { headers: getAuthHeaders() });
                          const cFee = res.data.course_fee || res.data.courseFee || 0;
                          let sch = Number(updated.scholarship) || 0;
                          let dsc = Number(updated.discountPercentage) || 0;
                          let tot = cFee - sch;
                          tot = tot - ((tot * dsc) / 100);
                          updated.totalFees = tot > 0 ? tot.toFixed(2) : "0.00";
                        } catch (err) {
                          console.error(err);
                        }
                        setFees(updated);
                      }}
                      style={{
                        alignSelf: "flex-start",
                        marginTop: "4px",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#ef4444",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      ⚡ Auto-select Student's Enrolled Course ({getCourseInfo(studentEnrolledCourseId).name})
                    </button>
                  </div>
                )}
              </div>

              {renderInputField("Scholarship Amount (₹)", "scholarship", "e.g. 5000", FaGift, "number")}
              {renderInputField("Discount (%)", "discountPercentage", "e.g. 10", FaPercent, "number")}
              {renderInputField("Total Net Payable (₹)", "totalFees", "Calculated Net Fee", FaMoneyBillWave, "number", true, true, true)}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 32px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(99, 102, 241, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                <FaSave size={14} /> Save & Generate Fee
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Toolbar */}
        <div style={{
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          borderBottom: `1px solid ${themeStyles.cardBorder}`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "17px", fontWeight: "700" }}>
              Fees Directory List
            </h3>
            <span style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "#4f46e5",
              fontWeight: "700"
            }}>
              {filteredFees.length} Records
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FaFilter size={13} color={themeStyles.textSecondary} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "13px",
                  outline: "none"
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">🟢 Fully Paid</option>
                <option value="Partial">🟡 Partial Due</option>
                <option value="Pending">🔴 Pending Due</option>
              </select>
            </div>

            {/* Search Box */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <FaSearch style={{ position: "absolute", left: "12px", color: themeStyles.textSecondary, fontSize: "13px" }} />
              <input
                type="text"
                placeholder="Search Student ID, Name, Roll No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px 8px 34px",
                  borderRadius: "10px",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  background: themeStyles.inputBg,
                  color: themeStyles.textPrimary,
                  fontSize: "13px",
                  outline: "none",
                  width: "240px"
                }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Fees Table */}
        <div style={{ overflowX: "auto", padding: "0 28px 80px 28px", minHeight: "420px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "13.5px" }}>
            <thead>
              <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left", borderBottom: `2px solid ${themeStyles.inputBorder}` }}>
                <th style={{ padding: "14px 10px" }}>Fee Voucher</th>
                <th style={{ padding: "14px 10px" }}>Student ID</th>
                <th style={{ padding: "14px 10px" }}>Student Details</th>
                <th style={{ padding: "14px 10px" }}>Course</th>
                <th style={{ padding: "14px 10px" }}>Base Fee</th>
                <th style={{ padding: "14px 10px" }}>Scholarship / Disc.</th>
                <th style={{ padding: "14px 10px" }}>Total Net Fee</th>
                <th style={{ padding: "14px 10px" }}>Paid Amount</th>
                <th style={{ padding: "14px 10px" }}>Pending Due</th>
                <th style={{ padding: "14px 10px" }}>Status</th>
                <th style={{ padding: "14px 10px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ padding: "36px", textAlign: "center", color: themeStyles.textSecondary }}>
                    Loading fee directory and payment records...
                  </td>
                </tr>
              ) : filteredFees.length > 0 ? (
                filteredFees.map((item, idx) => {
                  const feeId = item.feeId || item.fee_id;
                  const sId = item.studentId || item.student_id;
                  const cId = item.courseId || item.course_id;

                  const sInfo = getStudentInfo(sId);
                  const cInfo = getCourseInfo(cId);
                  const { paidAmount, pendingDue, status, totalFees } = getFeeFinancials(item);

                  const scholarship = Number(item.scholarship || item.scholarship_amount || 0);
                  const discount = Number(item.discountPercentage || item.discount_percentage || 0);
                  const baseCourseFee = cInfo.fee > 0 ? cInfo.fee : totalFees + scholarship;

                  return (
                    <tr key={idx} style={{
                      borderBottom: `1px solid ${themeStyles.inputBorder}`,
                      transition: "background 0.2s ease"
                    }}>
                      {/* Fee Voucher ID */}
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: "800",
                          fontSize: "12px",
                          color: "#6366f1",
                          background: "rgba(99, 102, 241, 0.1)",
                          padding: "4px 8px",
                          borderRadius: "8px"
                        }}>
                          <FaHashtag size={10} /> FEE-{feeId}
                        </span>
                      </td>

                      {/* Prominent Student ID Column */}
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{
                          display: "inline-block",
                          fontWeight: "800",
                          fontSize: "12px",
                          color: "#4f46e5",
                          background: darkMode ? "rgba(79, 70, 229, 0.25)" : "#e0e7ff",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          border: "1px solid rgba(79, 70, 229, 0.3)"
                        }}>
                          ID: #{sId}
                        </span>
                      </td>

                      {/* Student Details (Name & Roll No) */}
                      <td style={{ padding: "14px 10px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                          {sInfo.name}
                        </div>
                        {sInfo.roll && sInfo.roll !== "-" && (
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#0284c7",
                            display: "inline-block",
                            marginTop: "2px"
                          }}>
                            Roll No: {sInfo.roll}
                          </span>
                        )}
                      </td>

                      {/* Course with Live DB Hover Popover */}
                      {(() => {
                        const isCurrentHovered = hoveredCourseId === cId && hoveredRowIndex === idx;
                        const isNearBottom = idx >= filteredFees.length - 2 && filteredFees.length > 2;
                        const courseDetail = getCourseInfo(cId);

                        return (
                          <td
                            style={{ padding: "14px 10px", position: "relative" }}
                            onMouseEnter={() => handleCourseMouseEnter(cId, idx)}
                            onMouseLeave={handleCourseMouseLeave}
                          >
                            <div
                              style={{
                                display: "inline-flex",
                                flexDirection: "column",
                                gap: "2px",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                background: isCurrentHovered
                                  ? (darkMode ? "rgba(99, 102, 241, 0.25)" : "#e0e7ff")
                                  : (darkMode ? "rgba(255, 255, 255, 0.04)" : "#f8fafc"),
                                border: `1.5px solid ${isCurrentHovered ? "#6366f1" : (darkMode ? "#334155" : "#e2e8f0")}`,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: isCurrentHovered ? "0 4px 14px rgba(99, 102, 241, 0.25)" : "none"
                              }}
                              title="Hover to view live Database Course & Semester details"
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <FaGraduationCap size={13} color="#6366f1" />
                                <span style={{ fontWeight: "800", color: themeStyles.textPrimary, fontSize: "13px" }}>
                                  {courseDetail.name}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                                <span style={{ color: "#6366f1", fontWeight: "700" }}>
                                  Course #{cId}
                                </span>
                                {courseDetail.semester && courseDetail.semester !== "N/A" && courseDetail.semester !== "-" && (
                                  <span style={{
                                    color: themeStyles.textSecondary,
                                    fontWeight: "600",
                                    background: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                                    padding: "1px 6px",
                                    borderRadius: "6px"
                                  }}>
                                    {courseDetail.semester.toString().toLowerCase().includes("sem") ? courseDetail.semester : `Sem ${courseDetail.semester}`}
                                  </span>
                                )}
                                <FaInfoCircle size={10} color="#6366f1" style={{ opacity: 0.7 }} />
                              </div>
                            </div>

                            {/* Floating Live DB Tooltip / Popover */}
                            {isCurrentHovered && (
                              <div
                                style={{
                                  position: "absolute",
                                  [isNearBottom ? "bottom" : "top"]: "calc(100% + 6px)",
                                  left: "10px",
                                  zIndex: 99999,
                                  minWidth: "330px",
                                  maxWidth: "380px",
                                  background: darkMode ? "#0f172a" : "#ffffff",
                                  color: themeStyles.textPrimary,
                                  border: `2px solid ${darkMode ? "#6366f1" : "#4f46e5"}`,
                                  borderRadius: "16px",
                                  boxShadow: darkMode
                                    ? "0 20px 40px -8px rgba(0, 0, 0, 0.85), 0 0 25px rgba(99, 102, 241, 0.35)"
                                    : "0 20px 40px -8px rgba(79, 70, 229, 0.28), 0 8px 24px rgba(0, 0, 0, 0.12)",
                                  padding: "18px",
                                  pointerEvents: "auto",
                                  textAlign: "left"
                                }}
                              >
                                {/* Popover Header */}
                                <div style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: "8px",
                                  marginBottom: "14px",
                                  borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                                  paddingBottom: "10px"
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                                      color: "#ffffff",
                                      padding: "8px",
                                      borderRadius: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      boxShadow: "0 4px 10px rgba(79, 70, 229, 0.35)"
                                    }}>
                                      <FaGraduationCap size={18} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: "15px", fontWeight: "800", color: themeStyles.textPrimary, lineHeight: "1.2" }}>
                                        {courseDetail.name}
                                      </div>
                                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", marginTop: "3px" }}>
                                        Database Record: Course ID #{cId}
                                      </div>
                                    </div>
                                  </div>
                                  <span style={{
                                    fontSize: "10px",
                                    fontWeight: "800",
                                    padding: "3px 8px",
                                    borderRadius: "12px",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    color: "#10b981",
                                    border: "1px solid rgba(16, 185, 129, 0.3)",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {hoverLoading ? "⚡ Fetching DB..." : "● Live Database"}
                                  </span>
                                </div>

                                {/* Grid: Semester & Standard Fee directly from course_management DB */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                                  {/* Semester */}
                                  <div style={{
                                    background: darkMode ? "#1e293b" : "#f8fafc",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`
                                  }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                      <FaCalendarAlt size={10} color="#6366f1" /> Semester
                                    </div>
                                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#4f46e5" }}>
                                      {courseDetail.semester && courseDetail.semester !== "-" && courseDetail.semester !== "N/A"
                                        ? (courseDetail.semester.toString().toLowerCase().includes("sem") ? courseDetail.semester : `Semester ${courseDetail.semester}`)
                                        : "Semester N/A"}
                                    </div>
                                  </div>

                                  {/* Standard Course Fee */}
                                  <div style={{
                                    background: darkMode ? "#1e293b" : "#f8fafc",
                                    padding: "10px 12px",
                                    borderRadius: "10px",
                                    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`
                                  }}>
                                    <div style={{ fontSize: "11px", fontWeight: "700", color: themeStyles.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                                      <FaMoneyBillWave size={10} color="#10b981" /> Base Course Fee
                                    </div>
                                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#10b981" }}>
                                      ₹{Number(courseDetail.fee || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>

                                {/* Student Fee Voucher Breakdown */}
                                <div style={{
                                  background: darkMode ? "rgba(99, 102, 241, 0.08)" : "#f1f5f9",
                                  padding: "12px",
                                  borderRadius: "12px",
                                  border: `1px dashed ${darkMode ? "rgba(99, 102, 241, 0.35)" : "#cbd5e1"}`,
                                  fontSize: "12px"
                                }}>
                                  <div style={{ fontWeight: "700", color: themeStyles.textPrimary, marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                                    <span>📄 Fee Voucher (FEE-{feeId}):</span>
                                    <span style={{
                                      fontSize: "11px",
                                      fontWeight: "800",
                                      color: status === "Paid" ? "#10b981" : (status === "Partial" ? "#f59e0b" : "#ef4444")
                                    }}>
                                      {status}
                                    </span>
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ color: themeStyles.textSecondary }}>Student:</span>
                                    <span style={{ fontWeight: "700" }}>{sInfo.name} (#{sId})</span>
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ color: themeStyles.textSecondary }}>Standard Prescribed Fee:</span>
                                    <span style={{ fontWeight: "700" }}>₹{Number(courseDetail.fee || 0).toLocaleString('en-IN')}</span>
                                  </div>

                                  {(scholarship > 0 || discount > 0) && (
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#10b981" }}>
                                      <span>Scholarship / Discount:</span>
                                      <span style={{ fontWeight: "700" }}>
                                        {scholarship > 0 ? `-₹${scholarship.toLocaleString('en-IN')}` : ''}
                                        {discount > 0 ? ` (${discount}% off)` : ''}
                                      </span>
                                    </div>
                                  )}

                                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, paddingTop: "5px", marginTop: "4px" }}>
                                    <span style={{ fontWeight: "700", color: themeStyles.textPrimary }}>Net Billed Voucher:</span>
                                    <span style={{ fontWeight: "800", color: "#3b82f6" }}>₹{totalFees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                                    <span style={{ color: themeStyles.textSecondary }}>Amount Paid:</span>
                                    <span style={{ fontWeight: "800", color: "#10b981" }}>₹{paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                                  </div>

                                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                    <span style={{ color: themeStyles.textSecondary, fontWeight: "600" }}>Remaining Due:</span>
                                    <span style={{ fontWeight: "800", color: pendingDue > 0 ? "#ef4444" : "#10b981" }}>
                                      ₹{pendingDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>

                                {/* Explanatory Footer */}
                                <div style={{ marginTop: "10px", fontSize: "11px", color: themeStyles.textSecondary, fontStyle: "italic", textAlign: "center" }}>
                                  💡 Course & Semester details returned directly from MySQL database.
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })()}

                      {/* Base Course Fee */}
                      <td style={{ padding: "14px 10px", color: themeStyles.textSecondary }}>
                        ₹{baseCourseFee.toLocaleString('en-IN')}
                      </td>

                      {/* Scholarship & Discount */}
                      <td style={{ padding: "14px 10px" }}>
                        {scholarship > 0 ? (
                          <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                            -₹{scholarship.toLocaleString('en-IN')}
                          </div>
                        ) : null}
                        {discount > 0 ? (
                          <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "600" }}>
                            Disc: {discount}%
                          </div>
                        ) : null}
                        {scholarship === 0 && discount === 0 && (
                          <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>None</span>
                        )}
                      </td>

                      {/* Net Total Fee */}
                      <td style={{ padding: "14px 10px", fontWeight: "800", color: "#3b82f6", fontSize: "14px" }}>
                        ₹{totalFees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      {/* Paid Amount */}
                      <td style={{ padding: "14px 10px", fontWeight: "700", color: "#10b981" }}>
                        ₹{paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      {/* Pending Due */}
                      <td style={{
                        padding: "14px 10px",
                        fontWeight: "800",
                        color: pendingDue > 0 ? "#ef4444" : "#10b981"
                      }}>
                        ₹{pendingDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>

                      {/* Payment Status Badge */}
                      <td style={{ padding: "14px 10px" }}>
                        {status === "Paid" && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)"
                          }}>
                            <FaCheckCircle size={10} /> Paid
                          </span>
                        )}
                        {status === "Partial" && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.3)"
                          }}>
                            <FaClock size={10} /> Partial
                          </span>
                        )}
                        {status === "Pending" && (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.3)"
                          }}>
                            <FaExclamationCircle size={10} /> Unpaid
                          </span>
                        )}
                      </td>

                      {/* Action / Pay Fees */}
                      <td style={{ padding: "14px 10px", textAlign: "center" }}>
                        {pendingDue > 0 ? (
                          <button
                            type="button"
                            onClick={() => navigate('/payment')}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)"
                            }}
                          >
                            <FaCreditCard size={11} /> Pay
                          </button>
                        ) : (
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#10b981",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <FaReceipt size={11} /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" style={{ padding: "40px 20px", textAlign: "center", color: themeStyles.textSecondary }}>
                    <FaFileInvoiceDollar size={36} color={themeStyles.textSecondary} style={{ marginBottom: "12px", opacity: 0.5 }} />
                    <div style={{ fontSize: "15px", fontWeight: "700", color: themeStyles.textPrimary }}>
                      {isStudent
                        ? `No fee records found for Student ID #${currentStudentProfile?.student_id || currentUserId || ""}`
                        : "No fee records found matching criteria."}
                    </div>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                      {isStudent
                        ? "If you have recently enrolled, your fee structure will appear here once generated by accounts office."
                        : "Use the form above to add a new fee record."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Fees;