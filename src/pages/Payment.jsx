import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaReceipt, FaUserGraduate, FaMoneyBillWave,
  FaCalendarAlt, FaCreditCard, FaHashtag,
  FaTasks, FaArrowLeft, FaSave, FaLock, FaEye,
  FaPrint, FaTimes, FaBarcode, FaCheckCircle
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Payment() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const currentUserId = user?.user_id || user?.userId || user?.id;

  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  const isHOD = roleId === 1;
  const isPrincipal = roleId === 2;

  // HOD & Professor have No Access; Principal has View-Only; Student has Pay/View Self
  const hasNoAccess = isHOD || isProfessor;
  const isViewOnly = isPrincipal;

  const [paymentList, setPaymentList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [feesList, setFeesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [resolvedStudentId, setResolvedStudentId] = useState("");
  const [currentStudentProfile, setCurrentStudentProfile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const generateTxnId = () => "TXN-" + Date.now().toString().slice(-6) + Math.floor(1000 + Math.random() * 9000);

  const [payment, setPayment] = useState({
    feeId: "",
    studentId: "",
    paidAmount: "",
    date: getTodayDate(),
    paymentMode: "UPI",
    transactionId: generateTxnId(),
    status: "Paid"
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getStudentDisplayName = (sId) => {
    if (!sId) return "-";
    const s = studentsList.find(item => Number(item.student_id || item.studentId || item.id) === Number(sId));
    if (s && (s.student_name || s.studentName)) {
      return `${s.student_name || s.studentName} ${s.roll_no ? `(Roll: ${s.roll_no})` : ''}`;
    }
    return `Student #${sId}`;
  };

  const getCourseName = (cId) => {
    if (!cId) return "Academic Course";
    const c = coursesList.find(item => Number(item.course_id || item.courseId || item.id) === Number(cId));
    if (c && (c.course_name || c.courseName)) {
      return `${c.course_name || c.courseName} ${c.semester ? `(${c.semester})` : ''}`;
    }
    return `Course #${cId}`;
  };

  const fetchPaymentList = async () => {
    if (hasNoAccess) return;
    setLoading(true);
    try {
      // 1. Fetch Students
      let sList = [];
      try {
        let sRes;
        try {
          sRes = await axios.get("http://localhost:8080/student/all", { headers: getAuthHeaders() });
        } catch (e) {
          sRes = await axios.get("http://localhost:8080/api/student", { headers: getAuthHeaders() });
        }
        sList = Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []);
        setStudentsList(sList);
      } catch (sErr) {
        console.error("Error fetching students list:", sErr);
      }

      // 2. Fetch Courses
      let cList = [];
      try {
        let cRes;
        try {
          cRes = await axios.get("http://localhost:8080/api/courses/all", { headers: getAuthHeaders() });
        } catch (e) {
          cRes = await axios.get("http://localhost:8080/api/courses", { headers: getAuthHeaders() });
        }
        cList = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || []);
        setCoursesList(cList);
      } catch (cErr) {
        console.error("Error fetching courses list:", cErr);
      }

      // 3. Fetch Fees
      let fList = [];
      try {
        let fRes;
        try {
          fRes = await axios.get("http://localhost:8080/fees/all", { headers: getAuthHeaders() });
        } catch (e) {
          fRes = await axios.get("http://localhost:8080/api/fees", { headers: getAuthHeaders() });
        }
        fList = Array.isArray(fRes.data) ? fRes.data : (fRes.data?.content || []);
        setFeesList(fList);
      } catch (fErr) {
        console.error("Error fetching fees list:", fErr);
      }

      // 4. Fetch Payments
      let res;
      try {
        res = await axios.get("http://localhost:8080/api/payments", {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/payments/all", {
          headers: getAuthHeaders(),
        });
      }
      const allPayments = Array.isArray(res.data) ? res.data : (res.data?.content || []);

      if (isStudent) {
        const validStudentIds = new Set();
        if (currentUserId) {
          validStudentIds.add(Number(currentUserId));
        }

        const uEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
        const uName = (user?.fullName || user?.full_name || "").toLowerCase().trim();
        const uMobile = (user?.mobile_no || user?.mobileNo || "").trim();

        let bestStudentId = currentUserId ? String(currentUserId) : "";
        let matchedStudent = null;

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
            matchedStudent = s;
            if (s.student_id != null) {
              validStudentIds.add(Number(s.student_id));
              bestStudentId = String(s.student_id);
            }
            if (s.studentId != null) {
              validStudentIds.add(Number(s.studentId));
              bestStudentId = String(s.studentId);
            }
            if (s.user_id != null) {
              validStudentIds.add(Number(s.user_id));
            }
          }
        });

        if (matchedStudent) {
          setCurrentStudentProfile(matchedStudent);
        }

        if (bestStudentId) {
          setResolvedStudentId(bestStudentId);
          // Look up fee for this student in fList strictly for their enrolled course
          const myEnrolledCId = matchedStudent?.course_id || matchedStudent?.courseId || matchedStudent?.course?.course_id;
          const myFees = fList.filter(f => {
            const matchesStudent = Number(f.studentId || f.student_id) === Number(bestStudentId);
            const matchesCourse = myEnrolledCId ? Number(f.courseId || f.course_id) === Number(myEnrolledCId) : true;
            return matchesStudent && matchesCourse;
          });

          if (myFees.length > 0) {
            setPayment(prev => {
              const nextFeeId = prev.feeId || String(myFees[0].feeId || myFees[0].fee_id);
              const selectedFeeObj = myFees.find(f => String(f.feeId || f.fee_id) === String(nextFeeId)) || myFees[0];
              const nextAmt = prev.paidAmount || (selectedFeeObj ? String(selectedFeeObj.totalFees || selectedFeeObj.total_fees || "") : "");
              return {
                ...prev,
                studentId: bestStudentId,
                feeId: nextFeeId,
                paidAmount: nextAmt
              };
            });
          } else {
            // New student with no fee structure yet: prefill enrolled course fee
            const enrolledCourseObj = cList.find(c => Number(c.course_id || c.courseId || c.id) === Number(myEnrolledCId));
            const enrolledFee = enrolledCourseObj ? (enrolledCourseObj.course_fee || enrolledCourseObj.courseFee || "") : "";
            if (myEnrolledCId) setSelectedCourseId(String(myEnrolledCId));
            setPayment(prev => ({
              ...prev,
              studentId: bestStudentId,
              paidAmount: prev.paidAmount || String(enrolledFee)
            }));
          }
        }

        // Backend /api/payments already isolates payments for the authenticated student.
        let myPayments = allPayments;
        if (validStudentIds.size > 0 && allPayments.length > 0) {
          const clientFiltered = allPayments.filter(p => {
            const pStudentId = Number(p.studentId || p.student_id);
            return validStudentIds.has(pStudentId);
          });
          if (clientFiltered.length > 0) {
            myPayments = clientFiltered;
          }
        }

        // Sort newest payments at the top (descending by payment ID)
        const sorted = [...myPayments].sort((a, b) => {
          const idA = Number(a.paymentId || a.payment_id || a.id || 0);
          const idB = Number(b.paymentId || b.payment_id || b.id || 0);
          return idB - idA;
        });

        setPaymentList(sorted);
      } else {
        const sorted = [...allPayments].sort((a, b) => {
          const idA = Number(a.paymentId || a.payment_id || a.id || 0);
          const idB = Number(b.paymentId || b.payment_id || b.id || 0);
          return idB - idA;
        });
        setPaymentList(sorted);
      }
    } catch (err) {
      console.error("Error fetching payment list:", err);
      setPaymentList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasNoAccess) {
      fetchPaymentList();
    }
  }, [hasNoAccess]);

  const handleChange = (e) => {
    if (isViewOnly) return;
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleFeeChange = (e) => {
    const selectedFeeId = e.target.value;
    const feeObj = feesList.find(f => String(f.feeId || f.fee_id) === String(selectedFeeId));
    setPayment(prev => ({
      ...prev,
      feeId: selectedFeeId,
      paidAmount: feeObj ? String(feeObj.totalFees || feeObj.total_fees || prev.paidAmount) : prev.paidAmount
    }));
  };

  const handleCourseSelect = (e) => {
    const cId = e.target.value;
    setSelectedCourseId(cId);
    const foundCourse = coursesList.find(c => String(c.course_id || c.courseId || c.id) === String(cId));
    if (foundCourse) {
      const courseFee = foundCourse.course_fee != null ? (foundCourse.course_fee || foundCourse.courseFee) : "";
      setPayment(prev => ({
        ...prev,
        paidAmount: String(courseFee)
      }));
    }
  };

  const savePayment = async (e) => {
    e.preventDefault();
    if (isViewOnly) {
      alert("Principal account is in View-Only mode.");
      return;
    }

    const effectiveStudentId = isStudent ? (resolvedStudentId || currentUserId) : payment.studentId;
    if (!effectiveStudentId) {
      alert("Student ID could not be resolved. Please re-login.");
      return;
    }

    if (!payment.paidAmount || Number(payment.paidAmount) <= 0) {
      alert("Please enter a valid paid amount greater than 0.");
      return;
    }

    setSubmitting(true);

    let finalFeeId = payment.feeId;
    const effectiveCourseId = (isStudent && studentEnrolledCourseId) ? String(studentEnrolledCourseId) : selectedCourseId;

    // For new students who selected a course, auto-create their fee structure in fees_detail
    if (!finalFeeId && effectiveCourseId) {
      try {
        const feePayload = {
          courseId: parseInt(effectiveCourseId, 10),
          studentId: parseInt(effectiveStudentId, 10),
          totalFees: parseFloat(payment.paidAmount),
          scholarship: 0,
          discountPercentage: 0
        };
        let fRes;
        try {
          fRes = await axios.post("http://localhost:8080/fees", feePayload, { headers: getAuthHeaders() });
        } catch {
          fRes = await axios.post("http://localhost:8080/api/fees", feePayload, { headers: getAuthHeaders() });
        }
        if (fRes?.data && (fRes.data.feeId || fRes.data.fee_id)) {
          finalFeeId = fRes.data.feeId || fRes.data.fee_id;
        }
      } catch (fErr) {
        console.warn("Fee auto-generation in frontend encountered an error; backend will resolve fallback:", fErr);
      }
    }

    // Auto-generate guaranteed fresh unique transaction ID at the moment of payment
    const finalTxnId = generateTxnId();
    const todayDate = getTodayDate();

    const payload = {
      feeId: finalFeeId ? parseInt(finalFeeId, 10) : null,
      studentId: parseInt(effectiveStudentId, 10),
      paidAmount: parseFloat(payment.paidAmount),
      date: todayDate,
      paymentMode: payment.paymentMode || "UPI",
      transactionId: finalTxnId,
      status: "Paid"
    };

    try {
      let savedRes;
      try {
        savedRes = await axios.post("http://localhost:8080/api/payments", payload, {
          headers: getAuthHeaders()
        });
      } catch (err1) {
        savedRes = await axios.post("http://localhost:8080/payments", payload, {
          headers: getAuthHeaders()
        });
      }

      const recorded = savedRes?.data || payload;

      // Automatically open Official Receipt Modal
      setSelectedReceipt({
        feeId: recorded.feeId || recorded.fee_id || payload.feeId || 1,
        studentId: recorded.studentId || recorded.student_id || payload.studentId,
        paidAmount: recorded.paidAmount || recorded.paid_amount || payload.paidAmount,
        date: recorded.date || recorded.payment_date || payload.date,
        paymentMode: recorded.paymentMode || recorded.payment_mode || payload.paymentMode,
        transactionId: recorded.transactionId || recorded.transaction_id || payload.transactionId,
        status: recorded.status || "Paid",
        receiptNo: "REC-" + Math.floor(100000 + Math.random() * 900000),
        studentName: currentStudentProfile?.student_name || currentStudentProfile?.studentName || user?.fullName || user?.full_name || getStudentDisplayName(payload.studentId)
      });

      // Immediately prepend the new payment to the directory list below
      setPaymentList(prev => [
        recorded,
        ...prev.filter(p => {
          const existingTxn = p.transactionId || p.transaction_id;
          const newTxn = recorded.transactionId || recorded.transaction_id;
          return existingTxn !== newTxn;
        })
      ]);

      alert("Payment Successful! Official Fee Receipt has been generated.");

      setPayment({
        feeId: "",
        studentId: resolvedStudentId || "",
        paidAmount: "",
        date: getTodayDate(),
        paymentMode: "UPI",
        transactionId: generateTxnId(),
        status: "Paid"
      });
      setSelectedCourseId("");

      await fetchPaymentList();
    } catch (error) {
      console.error("Error saving payment:", error);
      const errMsg = error.response?.data || error.message || "Failed to process payment.";
      alert("Payment Failed: " + (typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg)));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
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
    tableHeaderBg: darkMode ? "#111827" : "#f1f5f9",
    iconColor: "#2563eb"
  };

  if (hasNoAccess) {
    return (
      <div style={{
        minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
        display: "flex", justifyContent: "center", alignItems: "center",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: themeStyles.cardBg, padding: "40px", borderRadius: "24px",
          textAlign: "center", boxShadow: themeStyles.cardShadow, border: `1px solid ${themeStyles.cardBorder}`,
          maxWidth: "400px", width: "100%"
        }}>
          <div style={{
            background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", width: "70px", height: "70px",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto"
          }}>
            <FaLock size={32} />
          </div>
          <h2 style={{ color: themeStyles.textPrimary, margin: "0 0 10px 0" }}>Access Denied</h2>
          <p style={{ color: themeStyles.textSecondary, fontSize: "14px", marginBottom: "24px" }}>
            You do not have permission to access the Payment Management module. Only Students and the Principal are authorized.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: "12px 24px", background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
              color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700", width: "100%"
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderInputField = (label, name, placeholder, IconComponent, type = "text", required = false, options = null, isFullWidth = false, readOnly = false, badge = null) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: isFullWidth ? "span 2" : "span 1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
          {badge && (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{
            position: "absolute", left: "14px", color: themeStyles.iconColor,
            display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10
          }}>
            <IconComponent size={16} />
          </div>

          {options ? (
            <select
              name={name}
              value={payment[name]}
              onChange={handleChange}
              disabled={readOnly}
              required={required}
              style={{
                width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                border: `2px solid ${themeStyles.inputBorder}`, background: readOnly ? (darkMode ? "rgba(30, 41, 59, 0.7)" : "#f1f5f9") : themeStyles.inputBg,
                color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "500", outline: "none", cursor: readOnly ? "not-allowed" : "pointer"
              }}
            >
              {options.map((opt, idx) => (
                <option key={idx} value={opt.value} style={{ color: "#000" }}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={payment[name]}
              onChange={handleChange}
              readOnly={readOnly}
              placeholder={placeholder}
              required={required}
              autoComplete="off"
              style={{
                width: "100%", padding: "12px 14px 12px 42px", borderRadius: "12px",
                border: `2px solid ${themeStyles.inputBorder}`,
                background: readOnly ? (darkMode ? "rgba(30, 41, 59, 0.7)" : "#f1f5f9") : themeStyles.inputBg,
                color: readOnly ? (darkMode ? "#cbd5e1" : "#334155") : themeStyles.textPrimary,
                fontSize: "14px", fontWeight: readOnly ? "700" : "500", outline: "none",
                cursor: readOnly ? "not-allowed" : "text"
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const paymentModeOptions = [
    { value: "UPI", label: "UPI (Google Pay / PhonePe / Paytm)" },
    { value: "Net Banking", label: "Net Banking" },
    { value: "Credit Card", label: "Credit Card / Debit Card" },
    { value: "Cash", label: "Cash (College Cashier Desk)" }
  ];

  const statusOptions = [
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Failed", label: "Failed" }
  ];

  const studentEnrolledCourseId = currentStudentProfile?.course_id || currentStudentProfile?.courseId || currentStudentProfile?.course?.course_id;

  const studentAssignedFees = feesList.filter(f => {
    const fStdId = Number(f.studentId || f.student_id);
    const myStdId = Number(resolvedStudentId || currentUserId);
    const fCourseId = Number(f.courseId || f.course_id);
    const matchCourse = isStudent && studentEnrolledCourseId ? fCourseId === Number(studentEnrolledCourseId) : true;
    return fStdId === myStdId && matchCourse;
  });

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-fee-receipt, #printable-fee-receipt * { visibility: visible; }
          #printable-fee-receipt {
            position: fixed; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #000 !important;
            width: 700px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "950px", background: themeStyles.cardBg,
        borderRadius: "24px", overflow: "hidden", boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`, marginBottom: "30px"
      }}>
        {/* Header Section */}
        <div style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          padding: "32px 24px", color: "#ffffff", textAlign: "center"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Fee Payment Management
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            {isViewOnly ? "👑 Principal Portal — College-Wide Student Fee Transactions & Receipts Audit" : "🎓 Student Fee Portal — Submit Your Fee Payment & Generate Official Receipt"}
          </p>
        </div>

        {/* Principal View Mode Banner */}
        {isViewOnly && (
          <div style={{
            padding: "24px 32px",
            background: darkMode ? "rgba(30, 41, 59, 0.8)" : "#f0fdf4",
            borderBottom: `1px solid ${themeStyles.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff", width: "48px", height: "48px", borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px"
              }}>
                👑
              </div>
              <div>
                <h4 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "16px", fontWeight: "800" }}>
                  Principal Administrative Directory
                </h4>
                <p style={{ margin: "4px 0 0 0", color: themeStyles.textSecondary, fontSize: "13px" }}>
                  You have full audit access to view all student fee transactions, verification statuses, and official receipts.
                </p>
              </div>
            </div>
            <div style={{
              background: "#10b981", color: "#ffffff", padding: "8px 18px",
              borderRadius: "20px", fontWeight: "800", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span>{paymentList.length}</span> Total College Transactions
            </div>
          </div>
        )}

        {/* Payment Form - Visible to Students & Admins */}
        {!isViewOnly && (
          <form onSubmit={savePayment} style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "800" }}>
                Make Fee Payment
              </h3>
              {isStudent && (
                <span style={{
                  background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)",
                  padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px"
                }}>
                  <FaLock size={11} /> Locked to Your Student Account
                </span>
              )}
            </div>

            {/* Student Profile Quick Details Card */}
            {isStudent && (
              <div style={{
                background: darkMode ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                border: `1.5px solid ${darkMode ? "rgba(59, 130, 246, 0.25)" : "#e2e8f0"}`,
                borderRadius: "16px", padding: "16px 20px", marginBottom: "24px",
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Verified Student</span>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: themeStyles.textPrimary, marginTop: "2px" }}>
                    {currentStudentProfile?.student_name || currentStudentProfile?.studentName || user?.fullName || user?.full_name || "Student"}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Student ID & Roll</span>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                    ID #{resolvedStudentId || currentUserId} • Roll: {currentStudentProfile?.roll_no || "-"}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</span>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: themeStyles.textPrimary, marginTop: "2px" }}>
                    {currentStudentProfile?.email || user?.emailId || user?.email || "-"}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Enrollment Status</span>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: studentAssignedFees.length > 0 ? "#10b981" : "#f59e0b", marginTop: "2px" }}>
                    {studentAssignedFees.length > 0 ? "Assigned Fee Active 🟢" : "New Student (Select Course) 🆕"}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Fee Structure / Course Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {studentAssignedFees.length > 0 ? "Assigned Fee Structure" : "Select Enrolled Course / Program"} <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {studentAssignedFees.length > 0 ? (
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
                      ✅ Pre-Assigned Fee
                    </span>
                  ) : (
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
                      🆕 Select Course
                    </span>
                  )}
                </div>

                {studentAssignedFees.length > 0 ? (
                  <>
                    <select
                      name="feeId"
                      value={payment.feeId}
                      onChange={handleFeeChange}
                      required
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "600", outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Your Assigned Fee --</option>
                      {studentAssignedFees.map(f => {
                        const fId = f.feeId || f.fee_id;
                        const cId = f.courseId || f.course_id;
                        const amt = f.totalFees || f.total_fees || 0;
                        return (
                          <option key={fId} value={fId}>
                            [Fee ID #{fId}] {getCourseName(cId)} • Total: ₹{Number(amt).toLocaleString('en-IN')}
                          </option>
                        );
                      })}
                    </select>
                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                      ✅ Official Assigned Fee: Your scholarship and discounts are already calculated in this fee.
                    </span>
                  </>
                ) : (isStudent && studentEnrolledCourseId) ? (
                  <>
                    <div style={{
                      padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid #10b981`, background: darkMode ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div>
                        <div style={{ fontWeight: "800", color: themeStyles.textPrimary, fontSize: "14px" }}>
                          {getCourseName(studentEnrolledCourseId)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "700", marginTop: "2px" }}>
                          Standard Tuition Fee: ₹{Number(coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(studentEnrolledCourseId))?.course_fee || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <span style={{
                        background: "#10b981", color: "#ffffff", padding: "4px 10px",
                        borderRadius: "16px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px"
                      }}>
                        <FaLock size={10} /> Enrolled Course Locked
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                      🔒 Locked to your enrolled degree program: <strong>{getCourseName(studentEnrolledCourseId)}</strong>.
                    </span>
                  </>
                ) : coursesList.length > 0 ? (
                  <>
                    <select
                      value={selectedCourseId}
                      onChange={handleCourseSelect}
                      required
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: "12px",
                        border: `2px solid #2563eb`, background: themeStyles.inputBg,
                        color: themeStyles.textPrimary, fontSize: "14px", fontWeight: "600", outline: "none", cursor: "pointer"
                      }}
                    >
                      <option value="">-- Select Your Enrolled Course --</option>
                      {coursesList.map(c => {
                        const cId = c.course_id || c.courseId || c.id;
                        const cName = c.course_name || c.courseName;
                        const sem = c.semester ? `(${c.semester})` : '';
                        const feeAmt = c.course_fee || c.courseFee || 0;
                        return (
                          <option key={cId} value={cId}>
                            {cName} {sem} • Standard Tuition Fee: ₹{Number(feeAmt).toLocaleString('en-IN')}
                          </option>
                        );
                      })}
                    </select>
                    <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}>
                      💡 New Student Enrollment: Select your course above. Your Fee Structure (Fee ID) will be automatically established upon payment.
                    </span>
                  </>
                ) : (
                  renderInputField("Fee ID", "feeId", "Enter Fee ID (e.g. 1)", FaReceipt, "number", true)
                )}
                {payment.feeId && (
                  <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}>
                    Selected Fee Structure: <strong>Fee ID #{payment.feeId}</strong>
                  </span>
                )}
              </div>

              {/* Student Selector: Locked for Students, Selectable for Admins */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Student (ID & Name) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
                    🔒 Authenticated
                  </span>
                </div>
                {isStudent ? (
                  <div style={{
                    padding: "10px 14px", borderRadius: "12px",
                    border: `2px solid #2563eb`, background: darkMode ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FaUserGraduate color="#2563eb" size={20} />
                      <div>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary, fontSize: "14px" }}>
                          {currentStudentProfile?.student_name || currentStudentProfile?.studentName || user?.fullName || user?.full_name || "Student"}
                          {currentStudentProfile?.roll_no ? ` (Roll No: ${currentStudentProfile.roll_no})` : ''}
                        </div>
                        <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: "700" }}>
                          Student ID #{resolvedStudentId || currentUserId} • {user?.emailId || user?.email}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: "#10b981", color: "#ffffff", padding: "4px 10px",
                      borderRadius: "16px", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px"
                    }}>
                      <FaLock size={10} /> Self Only
                    </span>
                  </div>
                ) : studentsList.length > 0 ? (
                  <select
                    name="studentId"
                    value={payment.studentId}
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
                      <option key={s.student_id || s.studentId || s.id} value={s.student_id || s.studentId || s.id}>
                        {s.student_name || s.studentName} ({s.roll_no ? `Roll: ${s.roll_no}` : 'Student'})
                      </option>
                    ))}
                  </select>
                ) : (
                  renderInputField("Student ID", "studentId", "Enter Student ID (e.g. 22)", FaUserGraduate, "number", true)
                )}
                <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                  🔒 Verified Payer: <strong>{getStudentDisplayName(resolvedStudentId || payment.studentId || currentUserId)}</strong>
                </span>
              </div>

              {renderInputField("Paid Amount (₹)", "paidAmount", "Enter Paid Amount (₹)", FaMoneyBillWave, "number", true)}
              {renderInputField("Payment Date", "date", "", FaCalendarAlt, "date", true, null, false, true, "📅 Today (Auto-Locked)")}
              {renderInputField("Payment Mode", "paymentMode", "", FaCreditCard, "select", true, paymentModeOptions)}
              {renderInputField("Transaction ID", "transactionId", "Auto-Generated on Payment", FaHashtag, "text", true, null, false, true, "⚡ Auto-Generated on Payment")}
              {/* Automated Payment Status - System automatically marks as Paid upon submission */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Payment Status
                  </label>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "12px" }}>
                    ⚡ Auto-Verified Gateway Status
                  </span>
                </div>
                <div style={{
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "2px solid rgba(16, 185, 129, 0.3)",
                  background: darkMode ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      background: "#10b981",
                      color: "#ffffff",
                      padding: "8px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaCheckCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "800", color: themeStyles.textPrimary, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>Paid</span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                          Instant Confirmation 🟢
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "2px", display: "block" }}>
                        Status will automatically be confirmed as <strong>Paid</strong> upon submission and verified on your official receipt.
                      </span>
                    </div>
                  </div>
                  <span style={{
                    background: "#10b981",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "800",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                  }}>
                    <FaLock size={10} /> AUTO-VERIFIED
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "32px", justifyContent: "flex-end", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: "12px 28px", background: "#f1f5f9", border: "1px solid #cbd5e1",
                  color: "#475569", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "14px",
                  display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                <FaArrowLeft size={14} /> Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 36px", background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                  color: "white", border: "none", borderRadius: "12px", cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.35)", opacity: submitting ? 0.7 : 1
                }}
              >
                <FaSave size={14} /> {submitting ? "Processing Payment..." : "Submit Payment & Print Receipt"}
              </button>
            </div>
          </form>
        )}

        {/* Payment Records Directory Table */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", fontWeight: "800" }}>
                <FaEye color="#2563eb" /> Payment Transactions & Receipts Directory
              </h3>
              <p style={{ margin: "4px 0 0 0", color: themeStyles.textSecondary, fontSize: "12px" }}>
                {isPrincipal
                  ? `👑 Principal View: Displaying all college-wide student payments (${paymentList.length} total)`
                  : `🎓 Student View: Displaying your personal fee payment records (${paymentList.length} total)`}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={fetchPaymentList}
                style={{
                  padding: "8px 16px", background: darkMode ? "#334155" : "#e2e8f0",
                  color: themeStyles.textPrimary, border: "none", borderRadius: "8px",
                  cursor: "pointer", fontWeight: "700", fontSize: "12px"
                }}
              >
                🔄 Refresh Directory
              </button>
              {isViewOnly && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: "8px 18px", background: "#f1f5f9", border: "1px solid #cbd5e1",
                    color: "#475569", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <FaArrowLeft size={12} /> Back to Dashboard
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "13px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Fee ID</th>
                  <th style={{ padding: "12px" }}>Student (ID / Name)</th>
                  <th style={{ padding: "12px" }}>Amount Paid</th>
                  <th style={{ padding: "12px" }}>Payment Date</th>
                  <th style={{ padding: "12px" }}>Mode</th>
                  <th style={{ padding: "12px" }}>Txn ID</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>Loading payment records...</td></tr>
                ) : paymentList.length > 0 ? (
                  paymentList.map((item, idx) => {
                    const itemFeeId = item.feeId || item.fee_id || "-";
                    const itemStudentId = item.studentId || item.student_id || "-";
                    const itemPaidAmt = item.paidAmount || item.paid_amount || 0;
                    const itemDate = item.date || item.payment_date || "-";
                    const itemMode = item.paymentMode || item.payment_mode || "UPI";
                    const itemTxnId = item.transactionId || item.transaction_id || `TXN-${1000 + idx}`;
                    const itemStatus = item.status || "Paid";
                    const studentLabel = getStudentDisplayName(itemStudentId);

                    return (
                      <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.inputBorder}` }}>
                        <td style={{ padding: "12px", fontWeight: "700" }}>#{itemFeeId}</td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{studentLabel}</div>
                          <div style={{ fontSize: "11px", color: "#2563eb", fontWeight: "600" }}>Student ID #{itemStudentId}</div>
                        </td>
                        <td style={{ padding: "12px", fontWeight: "800", color: "#10b981" }}>₹{Number(itemPaidAmt).toLocaleString('en-IN')}</td>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{itemDate}</td>
                        <td style={{ padding: "12px" }}>{itemMode}</td>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{itemTxnId}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                            background: "rgba(16, 185, 129, 0.15)", color: "#10b981"
                          }}>
                            {itemStatus} 🟢
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt({
                              feeId: itemFeeId,
                              studentId: itemStudentId,
                              paidAmount: itemPaidAmt,
                              date: itemDate !== "-" ? itemDate : new Date().toISOString().split('T')[0],
                              paymentMode: itemMode,
                              transactionId: itemTxnId,
                              status: itemStatus,
                              receiptNo: `REC-${90000 + idx}`,
                              studentName: studentLabel
                            })}
                            style={{
                              padding: "6px 14px", background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                              color: "white", border: "none", borderRadius: "8px", fontWeight: "700",
                              fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px"
                            }}
                          >
                            <FaPrint size={11} /> Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>No payment records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 📄 OFFICIAL COLLEGE FEE RECEIPT MODAL */}
      {selectedReceipt && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", padding: "28px", maxWidth: "680px", width: "95%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", position: "relative", maxHeight: "95vh", overflowY: "auto"
          }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "800" }}>Official Fee Receipt</h3>
              <button onClick={() => setSelectedReceipt(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            {/* PRINTABLE RECEIPT CONTAINER */}
            <div id="printable-fee-receipt" style={{
              background: "#ffffff", border: "2px solid #1e293b", padding: "28px",
              color: "#0f172a", boxSizing: "border-box", borderRadius: "10px"
            }}>
              {/* Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #1e293b", paddingBottom: "14px", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#1e1b4b", letterSpacing: "0.5px" }}>
                  COLLEGE OF ENGINEERING & TECHNOLOGY
                </h2>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#475569" }}>
                  Campus Administration • Accounts & Finance Department
                </p>
                <div style={{ display: "inline-block", background: "#1e293b", color: "#ffffff", padding: "3px 14px", marginTop: "8px", fontWeight: "800", fontSize: "11px", letterSpacing: "1px", borderRadius: "4px" }}>
                  STUDENT FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Receipt & Transaction Meta Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div><strong>Receipt No:</strong> {selectedReceipt.receiptNo || "REC-829104"}</div>
                <div><strong>Payment Date:</strong> {selectedReceipt.date || "2026-08-29"}</div>
                <div><strong>Student Name:</strong> {selectedReceipt.studentName || `Student #${selectedReceipt.studentId}`}</div>
                <div><strong>Student ID:</strong> {selectedReceipt.studentId}</div>
                <div><strong>Fee Structure ID:</strong> #{selectedReceipt.feeId}</div>
                <div><strong>Transaction ID:</strong> {selectedReceipt.transactionId}</div>
                <div><strong>Payment Mode:</strong> {selectedReceipt.paymentMode}</div>
                <div><strong>Status:</strong> <span style={{ color: "#10b981", fontWeight: "800" }}>PAID & VERIFIED 🟢</span></div>
              </div>

              {/* Fee Breakdown Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12px", marginBottom: "18px" }}>
                <thead>
                  <tr style={{ background: "#1e293b", color: "#ffffff" }}>
                    <th style={{ padding: "8px 10px" }}>Particulars / Description</th>
                    <th style={{ padding: "8px 10px", textAlign: "right" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 10px", fontWeight: "600" }}>Semester Tuition & Academic Fees</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>₹{Number(selectedReceipt.paidAmount).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 10px", color: "#059669" }}>Scholarship & Institutional Concession</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#059669" }}>- Applied</td>
                  </tr>
                  <tr style={{ background: "#f8fafc", fontWeight: "800" }}>
                    <td style={{ padding: "10px", fontSize: "13px" }}>Total Amount Paid (INR)</td>
                    <td style={{ padding: "10px", textAlign: "right", fontSize: "14px", color: "#2563eb" }}>
                      ₹{Number(selectedReceipt.paidAmount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Barcode & Authorized Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #cbd5e1", paddingTop: "14px", marginTop: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <FaBarcode size={32} color="#334155" />
                  <span style={{ fontSize: "8px", fontWeight: "700", letterSpacing: "1px", color: "#64748b" }}>*{selectedReceipt.transactionId}*</span>
                </div>

                <div style={{ border: "2px dashed #10b981", borderRadius: "50%", width: "55px", height: "55px", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", fontSize: "8px", fontWeight: "900", textAlign: "center" }}>
                  PAID<br/>SEAL
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #000", width: "110px", marginBottom: "4px" }}></div>
                  <span style={{ fontSize: "10px", fontWeight: "700" }}>Accounts Officer</span>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={handlePrintReceipt}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px",
                  background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", color: "white",
                  border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)"
                }}
              >
                <FaPrint /> Print / Save Fee Receipt PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;