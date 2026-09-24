import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaPoll, FaBook, FaCheckCircle, FaArrowLeft,
  FaSave, FaPrint, FaTimes, FaAward, FaFileAlt,
  FaSearch, FaFilter, FaUserGraduate, FaBookOpen
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Result() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  // Role 1 = HOD, Role 2 = Principal, Role 3 = Professor (Can Add/Publish Results for assigned subject), Role 4 = Student
  const isHod = roleId === 1;
  const isPrincipal = roleId === 2;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  // 👔 Real-world college logic:
  // - Principal (Role 2) & HOD (Role 1) oversee/monitor results (View-Only)
  // - ONLY Teaching Professors (Role 3) enter and publish examination marks for their subjects
  // - Students (Role 4) view strictly their own individual result/marksheet
  const canPublishResult = isProfessor;

  const [userStaff, setUserStaff] = useState(null);

  const [resultsList, setResultsList] = useState([]);
  const [allResultsRaw, setAllResultsRaw] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedResultForMarksheet, setSelectedResultForMarksheet] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const [result, setResult] = useState({
    studentId: "", subjectId: "", totalMarks: "", grade: "", status: "", gradeRemark: ""
  });

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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      // 1. Fetch Students & Subjects list (for selectors & student matching)
      let studentsData = [];
      let subjectsData = [];

      try {
        const studentRes = await axios.get("http://localhost:8080/student/all", { headers });
        studentsData = Array.isArray(studentRes.data) ? studentRes.data : (studentRes.data?.content || []);
        setStudentsList(studentsData);
      } catch (err) {
        console.warn("Could not fetch students list:", err);
      }

      try {
        const subjectRes = await axios.get("http://localhost:8080/api/subjects/all", { headers });
        subjectsData = Array.isArray(subjectRes.data) ? subjectRes.data : (subjectRes.data?.content || []);
      } catch (err) {
        console.warn("Could not fetch subjects list:", err);
      }

      try {
        let courseRes;
        try {
          courseRes = await axios.get("http://localhost:8080/api/courses/all", { headers });
        } catch {
          courseRes = await axios.get("http://localhost:8080/api/courses", { headers });
        }
        const coursesData = Array.isArray(courseRes.data) ? courseRes.data : (courseRes.data?.content || []);
        setCoursesList(coursesData);
      } catch (err) {
        console.warn("Could not fetch courses list in Result:", err);
      }

      // 2. Resolve Staff Profile for HOD (Role 1) and Professor (Role 3)
      let currentStaff = null;
      if (isHod || isProfessor) {
        try {
          const staffRes = await axios.get("http://localhost:8080/staff/all", { headers });
          const staffList = Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data?.content || []);
          const currentEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
          const currentUserId = user?.user_id || user?.userId || null;

          currentStaff = staffList.find(st =>
            (currentEmail && st.email?.toLowerCase().trim() === currentEmail) ||
            (currentUserId && Number(st.user_id || st.userId) === Number(currentUserId))
          );
          if (currentStaff) {
            setUserStaff(currentStaff);
          }
        } catch (e) {
          console.warn("Could not fetch staff profile in Result:", e);
        }
      }

      // 3. For Professor (Role 3): Filter Subject list strictly to Professor's assigned subjects or courses
      if (isProfessor) {
        setSubjectsList(subjectsData);

        // Auto-select if only 1 subject
        if (subjectsData.length === 1) {
          setResult(prev => ({ ...prev, subjectId: String(subjectsData[0].subject_id) }));
        }
      } else {
        setSubjectsList(subjectsData);
      }

      // 4. Resolve current student profile if role is Student (4)
      let matchedStudent = null;
      if (isStudent && studentsData.length > 0) {
        matchedStudent = studentsData.find(s =>
          (user.emailId && s.email && s.email.trim().toLowerCase() === user.emailId.trim().toLowerCase()) ||
          (user.email && s.email && s.email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
          (user.user_id && s.user_id && Number(s.user_id) === Number(user.user_id)) ||
          (user.full_name && s.student_name && s.student_name.trim().toLowerCase() === user.full_name.trim().toLowerCase()) ||
          (user.fullName && s.student_name && s.student_name.trim().toLowerCase() === user.fullName.trim().toLowerCase())
        );

        if (matchedStudent) {
          setStudentProfile(matchedStudent);
        }
      }

      // 5. Fetch Examination Results
      let resResults;
      try {
        resResults = await axios.get("http://localhost:8080/results/all", { headers });
      } catch (e) {
        resResults = await axios.get("http://localhost:8080/api/results", { headers });
      }

      let rawResults = Array.isArray(resResults.data) ? resResults.data : (resResults.data?.content || []);

      // 6. Role-based filtering for HOD (Role 1): strictly results of HOD's assigned course(s)!
      if (isHod && currentStaff) {
        const hodCourseIds = getStaffCourseIds(currentStaff);
        if (hodCourseIds.length > 0) {
          rawResults = rawResults.filter(item => {
            let itemCourseId = Number(item.courseId || item.course_id || item.subject?.courseId || item.student?.course_id);
            if (!itemCourseId && (item.subjectId || item.subject_id)) {
              const sId = Number(item.subjectId || item.subject_id);
              const matchedSub = subjectsData.find(s => Number(s.subject_id) === sId);
              if (matchedSub) {
                itemCourseId = Number(matchedSub.courseId || matchedSub.course_id);
              }
            }
            if (!itemCourseId && (item.studentId || item.student_id)) {
              const stId = Number(item.studentId || item.student_id);
              const matchedSt = studentsData.find(s => Number(s.student_id) === stId);
              if (matchedSt) {
                itemCourseId = Number(matchedSt.course_id || matchedSt.courseId);
              }
            }
            return itemCourseId && hodCourseIds.includes(itemCourseId);
          });
        }
      }

      // 6.5. Role-based filtering for Professor (Role 3): strictly results of Professor's assigned subjects or courses!
      if (isProfessor && currentStaff) {
        const profCourseIds = getStaffCourseIds(currentStaff);
        const profStaffId = Number(currentStaff.staffid || currentStaff.staffId);
        rawResults = rawResults.filter(item => {
          let itemCourseId = Number(item.courseId || item.course_id || item.subject?.courseId || item.student?.course_id);
          let itemStaffId = Number(item.staffId || item.staff_id || item.subject?.staffId || item.subject?.staff_id);

          if (!itemCourseId && (item.subjectId || item.subject_id)) {
            const sId = Number(item.subjectId || item.subject_id);
            const matchedSub = subjectsData.find(s => Number(s.subject_id) === sId);
            if (matchedSub) {
              itemCourseId = Number(matchedSub.courseId || matchedSub.course_id);
              if (!itemStaffId) itemStaffId = Number(matchedSub.staffId || matchedSub.staff_id);
            }
          }

          if (profStaffId && itemStaffId && itemStaffId === profStaffId) return true;
          if (itemCourseId && profCourseIds.includes(itemCourseId)) return true;
          return false;
        });
      }

      // Enrich result items with course and faculty names if missing
      rawResults.forEach(item => {
        const sId = Number(item.subjectId || item.subject_id);
        if (sId) {
          const matchedSub = subjectsData.find(s => Number(s.subject_id) === sId);
          if (matchedSub) {
            if (!item.courseName) item.courseName = matchedSub.course_name || matchedSub.courseName;
            if (!item.staffName) item.staffName = matchedSub.staff_name || matchedSub.staffName;
          }
        }
      });

      // 7. Role-based filtering for Student (Strictly PRESENT Enrolled Course & Subjects)
      if (isStudent) {
        const studentIdTarget = matchedStudent?.student_id || user?.student_id || user?.studentId || user?.user_id || user?.id;
        const currentStudentName = (user.full_name || user.fullName || matchedStudent?.student_name || "").trim().toLowerCase();
        const currentEmail = (user.emailId || user.email || matchedStudent?.email || "").trim().toLowerCase();
        const currentRollNo = (matchedStudent?.roll_no || "").trim().toLowerCase();
        const currentUserId = user?.user_id || user?.id || user?.userId;
        const studentCurrentCourseId = Number(matchedStudent?.course_id || matchedStudent?.courseId || user?.course_id || user?.courseId || 0);

        rawResults = rawResults.filter((item) => {
          const itemStudentId = item.studentId || item.student_id || item.student?.student_id;
          const itemStudentName = (item.studentName || item.student_name || item.student?.student_name || "").trim().toLowerCase();
          const itemStudentEmail = (item.studentEmail || item.student?.email || "").trim().toLowerCase();
          const itemRollNo = (item.studentRollNo || item.student?.roll_no || "").trim().toLowerCase();
          const itemUserId = item.userId || item.student?.user_id;

          let isMatch = false;
          if (studentIdTarget && itemStudentId && String(itemStudentId) === String(studentIdTarget)) isMatch = true;
          else if (currentUserId && itemUserId && String(itemUserId) === String(currentUserId)) isMatch = true;
          else if (currentUserId && itemStudentId && String(itemStudentId) === String(currentUserId)) isMatch = true;
          else if (currentStudentName && itemStudentName && currentStudentName === itemStudentName) isMatch = true;
          else if (currentEmail && itemStudentEmail && currentEmail === itemStudentEmail) isMatch = true;
          else if (currentRollNo && itemRollNo && currentRollNo === itemRollNo) isMatch = true;

          if (!isMatch) return false;

          // 🎓 CRITICAL REAL-WORLD COLLEGE RULE:
          // A student only sees examination results for their PRESENT enrolled course & its subjects!
          // Historical experiments or old course subjects are filtered out immediately.
          if (studentCurrentCourseId) {
            let itemCourseId = Number(item.courseId || item.course_id || item.subject?.courseId || 0);
            if (!itemCourseId && (item.subjectId || item.subject_id)) {
              const sId = Number(item.subjectId || item.subject_id);
              const matchedSub = subjectsData.find(s => Number(s.subject_id) === sId);
              if (matchedSub) {
                itemCourseId = Number(matchedSub.courseId || matchedSub.course_id || 0);
              }
            }
            if (itemCourseId && itemCourseId !== studentCurrentCourseId) {
              return false;
            }
          }

          return true;
        });

        // Deduplicate: If multiple attempts or tests were submitted for the same subject, show only the latest!
        const seenSubjects = new Set();
        rawResults = rawResults.filter(item => {
          const subId = Number(item.subjectId || item.subject_id || item.subject?.subject_id);
          if (subId) {
            if (seenSubjects.has(subId)) return false;
            seenSubjects.add(subId);
          }
          return true;
        });
      }

      // 8. Always Sort Newest First (Descending by Result ID)
      rawResults.sort((a, b) => {
        const idA = Number(a.result_id || a.resultId || 0);
        const idB = Number(b.result_id || b.resultId || 0);
        return idB - idA;
      });

      setAllResultsRaw(rawResults);
      setResultsList(rawResults);

    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live filter results based on search bar & status dropdown
  useEffect(() => {
    let filtered = [...allResultsRaw];

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const id = String(item.result_id || item.resultId || "");
        const student = (item.studentName || item.student_name || item.student?.student_name || "").toLowerCase();
        const subject = (item.subjectName || item.subject_name || item.subject?.subject_name || "").toLowerCase();
        const rollNo = (item.studentRollNo || item.student?.roll_no || "").toLowerCase();
        const grade = (item.grade || "").toLowerCase();
        return id.includes(q) || student.includes(q) || subject.includes(q) || rollNo.includes(q) || grade.includes(q);
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(item => item.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    setResultsList(filtered);
  }, [searchTerm, statusFilter, allResultsRaw]);

  // Auto-calculate Grade and Pass/Fail Status from marks (Strict University Standard)
  const calculateGradeAndStatus = (marksVal) => {
    if (marksVal === "" || marksVal === null || marksVal === undefined) {
      return { grade: "", status: "", remark: "" };
    }
    const marks = Number(marksVal);
    if (isNaN(marks)) {
      return { grade: "", status: "", remark: "" };
    }
    if (marks >= 90) return { grade: "A+", status: "Pass", remark: "Outstanding " };
    if (marks >= 80) return { grade: "A", status: "Pass", remark: "Excellent" };
    if (marks >= 70) return { grade: "B+", status: "Pass", remark: "Very Good" };
    if (marks >= 60) return { grade: "B", status: "Pass", remark: "Good" };
    if (marks >= 40) return { grade: "C", status: "Pass", remark: "Pass " };
    return { grade: "F", status: "Fail", remark: "Fail (Below 40)" };
  };

  const handleMarksChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === "") {
      setResult((prev) => ({ ...prev, totalMarks: "", grade: "", status: "", gradeRemark: "" }));
      return;
    }
    // Limit between 0 and 100
    let num = Number(rawVal);
    if (num > 100) num = 100;
    if (num < 0) num = 0;

    const { grade, status, remark } = calculateGradeAndStatus(num);
    setResult((prev) => ({
      ...prev,
      totalMarks: rawVal,
      grade: grade,
      status: status,
      gradeRemark: remark
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalMarks") {
      handleMarksChange(e);
    } else {
      setResult((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStudentSelect = (e) => {
    const val = e.target.value;
    setResult(prev => ({ ...prev, studentId: val }));
  };

  const handleSubjectSelect = (e) => {
    const val = e.target.value;
    setResult(prev => ({ ...prev, subjectId: val, studentId: "" }));
  };

  // For Professor: Filter students strictly enrolled in the selected subject's course
  const selectedSubjectObj = subjectsList.find(sub => String(sub.subject_id) === String(result.subjectId));
  const availableStudents = useMemo(() => {
    // If a subject is selected, strictly filter students of that subject's course
    if (selectedSubjectObj) {
      const subCourseId = Number(selectedSubjectObj.courseId || selectedSubjectObj.course_id);
      if (subCourseId) {
        return studentsList.filter(s => Number(s.course_id || s.courseId) === subCourseId);
      }
    }
    // If no subject selected yet, show students enrolled in any of assigned courses
    if (isProfessor || isHod) {
      const staffCourses = getStaffCourseIds(userStaff);
      if (staffCourses.length > 0) {
        return studentsList.filter(s => staffCourses.includes(Number(s.course_id || s.courseId)));
      }
    }
    return studentsList;
  }, [studentsList, selectedSubjectObj, userStaff, isProfessor, isHod]);

  // Helper to get descriptive course name for partitions
  const getCourseDisplayName = (courseId) => {
    if (!courseId) return "General / Other Course";
    const numId = Number(courseId);

    // 1. Match from coursesList
    const matchedCourse = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === numId);
    if (matchedCourse && (matchedCourse.course_name || matchedCourse.courseName)) {
      const name = matchedCourse.course_name || matchedCourse.courseName;
      const sem = matchedCourse.semester ? ` - ${matchedCourse.semester}` : "";
      return `${name}${sem}`;
    }

    // 2. Match from subjectsList
    const matchedSub = subjectsList.find(s => Number(s.courseId || s.course_id) === numId);
    if (matchedSub && (matchedSub.course_name || matchedSub.courseName)) {
      return matchedSub.course_name || matchedSub.courseName;
    }

    // 3. Match from studentsList
    const matchedStudent = studentsList.find(s => Number(s.course_id || s.courseId) === numId && (s.course_name || s.courseName));
    if (matchedStudent && (matchedStudent.course_name || matchedStudent.courseName)) {
      return matchedStudent.course_name || matchedStudent.courseName;
    }

    return `Course #${courseId}`;
  };

  // Group available students by course for dropdown partitioning (<optgroup>)
  const studentsGroupedByCourse = useMemo(() => {
    const map = {};
    availableStudents.forEach(s => {
      const cId = Number(s.course_id || s.courseId || 0);
      if (!map[cId]) {
        map[cId] = {
          courseId: cId,
          courseName: getCourseDisplayName(cId),
          students: []
        };
      }
      map[cId].students.push(s);
    });
    return Object.values(map);
  }, [availableStudents, coursesList, subjectsList, studentsList]);

  // Selected student details for chip display
  const selectedStudentObj = useMemo(() => {
    if (!result.studentId) return null;
    return studentsList.find(s => String(s.student_id) === String(result.studentId));
  }, [result.studentId, studentsList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!result.studentId || !result.subjectId || result.totalMarks === "") {
      alert("Please select Student, Subject, and enter Total Marks!");
      return;
    }

    const marksNum = Number(result.totalMarks);
    const { grade, status } = calculateGradeAndStatus(marksNum);

    const payload = {
      total_marks: parseInt(marksNum),
      grade: grade,
      status: status,
      student: { student_id: parseInt(result.studentId) },
      subject: { subject_id: parseInt(result.subjectId) }
    };

    try {
      try {
        await axios.post("http://localhost:8080/results", payload, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() }
        });
      } catch (e) {
        await axios.post("http://localhost:8080/api/results", payload, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() }
        });
      }

      alert("Result Published Successfully! It now appears at the top of the list.");
      setResult({ studentId: "", subjectId: "", totalMarks: "", grade: "", status: "", gradeRemark: "" });
      setNewlyAddedId(Date.now());
      fetchData();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save result. Please ensure Student ID and Subject ID exist.");
    }
  };

  const handlePrintMarksheet = () => {
    window.print();
  };

  const themeStyles = {
    pageBg: darkMode ? "linear-gradient(135deg, #090d16 0%, #111827 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 15px 35px rgba(0, 0, 0, 0.06)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
    labelColor: darkMode ? "#94a3b8" : "#475569",
    tableHeaderBg: darkMode ? "#0f172a" : "#f1f5f9",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-marksheet, #printable-marksheet * { visibility: visible; }
          #printable-marksheet {
            position: fixed; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #000 !important;
            width: 700px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "1350px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Top Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #7c3aed 100%)",
          borderRadius: "24px", padding: "30px 36px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 12px 30px rgba(2, 132, 199, 0.3)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaPoll size={26} />
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Academic Results & Marksheets</h1>
            </div>
            <p style={{ margin: "6px 0 0 48px", opacity: 0.9, fontSize: "14px" }}>
              {isPrincipal
                ? `🏛️ College Academic Results & Marksheet Overview — Super-Admin performance review and official grade records across all departments`
                : isHod
                ? `🏛️ Department Examination Grade Monitor — Courses: ${getStaffCourseIds(userStaff).map(id => `#${id}`).join(", ") || `#${userStaff?.course_id || 1}`} • Viewing official results across your department`
                : isProfessor
                ? `👨‍🏫 Enter student marks & publish semester examination results for your assigned subjects`
                : `Welcome ${user.full_name || studentProfile?.student_name || 'Student'} - Check your exam results & official grade sheet`}
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.4)", color: "#ffffff", padding: "12px 20px",
            borderRadius: "14px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
          }}>
            <FaArrowLeft /> Dashboard
          </button>
        </div>

        {/* 🏛️ PRINCIPAL COLLEGE-WIDE OVERVIEW BANNER */}
        {isPrincipal && (
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "28px 32px",
            border: `1.5px solid rgba(99, 102, 241, 0.3)`, boxShadow: themeStyles.cardShadow,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(99, 102, 241, 0.15)", color: "#6366f1",
                padding: "16px", borderRadius: "16px", display: "flex", fontSize: "28px"
              }}>
                🏛️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "10px" }}>
                  College Academic Results & Performance Oversight
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "rgba(99, 102, 241, 0.15)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                    Principal Monitor View-Only
                  </span>
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: themeStyles.textSecondary }}>
                  As Principal, you have complete super-admin oversight to review student grades, download official marksheets, and inspect pass/fail metrics. (Marks are entered and published directly by teaching professors).
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{
                background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.25)",
                padding: "8px 16px", borderRadius: "12px", fontSize: "12px", fontWeight: "700"
              }}>
                ✓ All Departments: Active
              </span>
            </div>
          </div>
        )}

        {/* 🏛️ HOD DEPARTMENT OVERVIEW BANNER */}
        {isHod && (
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "28px 32px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: "rgba(2, 132, 199, 0.15)", color: "#0284c7",
                padding: "16px", borderRadius: "16px", display: "flex", fontSize: "28px"
              }}>
                🏛️
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "10px" }}>
                  Department Grade Overview
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    {getStaffCourseIds(userStaff).length > 0
                      ? `Courses: ${getStaffCourseIds(userStaff).map(id => `#${id}`).join(", ")}`
                      : `Course #${userStaff?.course_id || 1}`}
                  </span>
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: themeStyles.textSecondary }}>
                  As HOD, you oversee the academic performance and examination results of your department. Marks are submitted individually by each subject professor.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{
                background: "rgba(2, 132, 199, 0.1)", color: "#0284c7", border: "1px solid rgba(2, 132, 199, 0.25)",
                padding: "8px 16px", borderRadius: "12px", fontSize: "12px", fontWeight: "700"
              }}>
                ✓ Department Filter: Active
              </span>
            </div>
          </div>
        )}

        {/* ADD RESULT FORM (Professor & Principal Access Only) */}
        {canPublishResult && (
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "36px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "10px" }}>
                  Publish Student Examination Result
                  <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "rgba(2, 132, 199, 0.15)", color: "#0284c7" }}>
                    AUTO-GRADE ENABLED
                  </span>
                  {isProfessor && (
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                      FACULTY PORTAL
                    </span>
                  )}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: themeStyles.textSecondary }}>
                  {isProfessor
                    ? "Select your assigned subject and enter student marks — Grade & Pass/Fail are calculated automatically!"
                    : "Enter marks (out of 100) — Grade and Pass/Fail status are automatically calculated!"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>

                {/* 1. Subject Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>
                    1. SELECT SUBJECT * {subjectsList.length > 0 && <span style={{ color: "#0284c7" }}>({subjectsList.length} Available)</span>}
                  </label>
                  {subjectsList.length > 0 ? (
                    <select
                      value={result.subjectId}
                      onChange={handleSubjectSelect}
                      required
                      style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600" }}
                    >
                      <option value="">-- Step 1: Select Subject --</option>
                      {subjectsList.map(sub => (
                        <option key={sub.subject_id} value={sub.subject_id}>
                          {sub.subjectName || sub.subject_name} ({sub.course_name ? `${sub.course_name}` : (sub.courseId || sub.course_id ? `Course #${sub.courseId || sub.course_id}` : 'General')}){sub.staff_name ? ` — Prof. ${sub.staff_name}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      name="subjectId"
                      value={result.subjectId}
                      onChange={handleChange}
                      placeholder="Enter Subject ID (e.g. 1)"
                      required
                      style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                    />
                  )}
                  {selectedSubjectObj && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "2px" }}>
                      <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                        📚 Linked Course: {selectedSubjectObj.course_name || selectedSubjectObj.courseName || `Course #${selectedSubjectObj.courseId || selectedSubjectObj.course_id}`}
                      </span>
                      {selectedSubjectObj.staff_name ? (
                        <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>
                          👨‍🏫 Assigned Prof: {selectedSubjectObj.staff_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "700" }}>
                          ℹ️ No Specific Professor Assigned
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Student Selector (Automatically partitioned by course with student counts) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>
                    2. SELECT STUDENT * {availableStudents.length > 0 && (
                      <span style={{ color: "#10b981" }}>
                        ({availableStudents.length} Students across {studentsGroupedByCourse.length} {studentsGroupedByCourse.length === 1 ? "Course" : "Courses"})
                      </span>
                    )}
                  </label>
                  {availableStudents.length > 0 ? (
                    <>
                      <select
                        value={result.studentId}
                        onChange={handleStudentSelect}
                        required
                        style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "14px", fontWeight: "600" }}
                      >
                        <option value="">-- Step 2: Select Enrolled Student --</option>
                        {studentsGroupedByCourse.map(grp => (
                          <optgroup
                            key={grp.courseId}
                            label={`🎓 ${grp.courseName} (${grp.students.length} ${grp.students.length === 1 ? "Student" : "Students"})`}
                          >
                            {grp.students.map(s => (
                              <option key={s.student_id} value={s.student_id}>
                                {s.student_name || s.studentName} ({s.roll_no || s.rollNo || 'Roll: -'})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      {selectedStudentObj && (
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "2px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background: "rgba(16, 185, 129, 0.1)",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#10b981"
                        }}>
                          <span>🎓 Selected: <strong>{selectedStudentObj.student_name || selectedStudentObj.studentName}</strong> (Roll: {selectedStudentObj.roll_no || selectedStudentObj.rollNo || '-'})</span>
                          <span style={{ opacity: 0.7 }}>•</span>
                          <span>{getCourseDisplayName(selectedStudentObj.course_id || selectedStudentObj.courseId)}</span>
                        </div>
                      )}
                    </>
                  ) : result.subjectId ? (
                    <div style={{
                      padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #ef4444",
                      background: "rgba(239, 68, 68, 0.08)", color: "#ef4444", fontSize: "12px", fontWeight: "700"
                    }}>
                      ⚠️ No students currently enrolled in this subject's course.
                    </div>
                  ) : (
                    <div style={{
                      padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`,
                      background: themeStyles.inputBg, color: themeStyles.textSecondary, fontSize: "12px", fontStyle: "italic"
                    }}>
                      👈 Select a subject above to view enrolled students.
                    </div>
                  )}
                </div>

                {/* Total Marks */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, display: "flex", justifyContent: "space-between" }}>
                    <span>TOTAL MARKS (OUT OF 100) *</span>
                    <span style={{ color: "#0284c7", fontSize: "11px", fontWeight: "600" }}>Type marks to auto-grade</span>
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={result.totalMarks}
                    onChange={handleMarksChange}
                    placeholder="Enter marks (0 - 100)"
                    min="0"
                    max="100"
                    required
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "15px", fontWeight: "700" }}
                  />
                  {result.totalMarks !== "" && (
                    <div style={{
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      background: result.status === "Pass" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: result.status === "Pass" ? "#10b981" : "#ef4444",
                      border: `1px solid ${result.status === "Pass" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                    }}>
                      <span>{result.status === "Pass" ? "✓" : "✗"}</span>
                      <span><strong>{result.grade || "F"}</strong> ({result.status.toUpperCase()})</span>
                    </div>
                  )}
                  <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>
                    <strong></strong>
                  </span>
                </div>

                {/* Grade (100% Auto-Calculated, Locked) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>GRADE (AUTO)</span>
                    <span style={{
                      fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px",
                      background: "rgba(2, 132, 199, 0.12)", color: "#0284c7"
                    }}>
                      🔒 LOCKED
                    </span>
                  </label>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${result.grade ? "#0284c7" : themeStyles.inputBorder}`,
                    background: result.grade ? "rgba(2, 132, 199, 0.08)" : (darkMode ? "#0b1329" : "#f8fafc"),
                    color: result.grade ? "#0284c7" : themeStyles.textSecondary,
                    minHeight: "48px",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: "not-allowed"
                  }}>
                    {result.grade ? (
                      <>
                        <span style={{ fontSize: "18px" }}>⭐ {result.grade}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", opacity: 0.85 }}>
                          {result.gradeRemark}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", fontWeight: "500", opacity: 0.6 }}>
                        Type marks to calculate...
                      </span>
                    )}
                  </div>
                </div>

                {/* Status (100% Auto-Calculated, Locked) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>RESULT STATUS (AUTO)</span>
                    <span style={{
                      fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px",
                      background: "rgba(2, 132, 199, 0.12)", color: "#0284c7"
                    }}>
                      🔒 LOCKED
                    </span>
                  </label>
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: `1.5px solid ${result.status ? (result.status === "Pass" ? "#10b981" : "#ef4444") : themeStyles.inputBorder}`,
                    background: result.status === "Pass" ? "rgba(16, 185, 129, 0.08)" : (result.status === "Fail" ? "rgba(239, 68, 68, 0.08)" : (darkMode ? "#0b1329" : "#f8fafc")),
                    color: result.status === "Pass" ? "#10b981" : (result.status === "Fail" ? "#ef4444" : themeStyles.textSecondary),
                    minHeight: "48px",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: "not-allowed"
                  }}>
                    {result.status ? (
                      <>
                        <span style={{ fontSize: "18px" }}>{result.status === "Pass" ? "✓" : "✗"}</span>
                        <span>{result.status === "Pass" ? "PASS" : "FAIL"}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "13px", fontWeight: "500", opacity: 0.6 }}>
                        Type marks to calculate...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "28px" }}>
                <button type="submit" style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "14px 36px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "white",
                  border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: "700",
                  boxShadow: "0 10px 25px rgba(2, 132, 199, 0.4)", transition: "transform 0.2s"
                }}>
                  <FaSave /> Save & Publish Result
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RESULTS DIRECTORY TABLE */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "24px", padding: "32px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
        }}>
          {/* Header and Filter Toolbar */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
            gap: "16px", marginBottom: "24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaAward color="#0284c7" size={22} />
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  Academic Grade Reports ({resultsList.length} Total)
                  {isHod && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: "rgba(2, 132, 199, 0.15)", color: "#0284c7" }}>
                      Course #{userStaff?.course_id || 1} Department
                    </span>
                  )}
                  {isProfessor && (
                    <span style={{ marginLeft: "10px", fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.15)", color: "#6366f1" }}>
                      Your Assigned Subjects
                    </span>
                  )}
                </h3>
                {isStudent && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                      Showing results for: <strong>{user.full_name || studentProfile?.student_name}</strong> (Roll: {studentProfile?.roll_no || `ID #${studentProfile?.student_id || user.user_id}`})
                    </span>
                    {(studentProfile?.course_id || studentProfile?.courseId) && (
                      <span style={{
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#10b981"
                      }}>
                        🎓 Current Program: {getCourseDisplayName(studentProfile?.course_id || studentProfile?.courseId)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Search & Status Filter */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", background: themeStyles.inputBg,
                border: `1px solid ${themeStyles.inputBorder}`, padding: "8px 14px", borderRadius: "12px"
              }}>
                <FaSearch color={themeStyles.textSecondary} size={14} />
                <input
                  type="text"
                  placeholder="Search student, subject, roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: themeStyles.textPrimary, fontSize: "13px", width: "200px"
                  }}
                />
                {searchTerm && (
                  <FaTimes
                    style={{ cursor: "pointer", color: themeStyles.textSecondary }}
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: "6px", background: themeStyles.inputBg,
                border: `1px solid ${themeStyles.inputBorder}`, padding: "8px 12px", borderRadius: "12px"
              }}>
                <FaFilter color={themeStyles.textSecondary} size={12} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: themeStyles.textPrimary, fontSize: "13px", cursor: "pointer"
                  }}
                >
                  <option value="All" style={{ background: themeStyles.cardBg, color: themeStyles.textPrimary }}>All Status</option>
                  <option value="Pass" style={{ background: themeStyles.cardBg, color: themeStyles.textPrimary }}>Pass Only</option>
                  <option value="Fail" style={{ background: themeStyles.cardBg, color: themeStyles.textPrimary }}>Fail Only</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", color: themeStyles.textPrimary, minWidth: "900px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg }}>
                  <th style={{ padding: "16px" }}>Result ID</th>
                  <th style={{ padding: "16px" }}>Student (ID/Name)</th>
                  <th style={{ padding: "16px" }}>Subject</th>
                  <th style={{ padding: "16px" }}>Marks</th>
                  <th style={{ padding: "16px" }}>Grade</th>
                  <th style={{ padding: "16px" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "center" }}>Download Marksheet</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "28px" }}>Loading examination results...</td></tr>
                ) : resultsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: themeStyles.textSecondary }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <FaPoll size={32} opacity={0.4} />
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>No results records found.</span>
                        <span style={{ fontSize: "12px" }}>
                          {isStudent ? "No examination results have been published for your profile yet." : "No results match your search filter."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  resultsList.map((res, idx) => {
                    const resId = res.result_id || res.resultId || (idx + 1);
                    const sName = res.studentName || res.student_name || res.student?.student_name || `Student #${res.studentId || res.student?.student_id}`;
                    const sRoll = res.studentRollNo || res.student?.roll_no;
                    const subName = res.subjectName || res.subject_name || res.subject?.subject_name || `Subject #${res.subjectId || res.subject?.subject_id}`;
                    const marks = res.totalMarks ?? res.total_marks ?? 0;
                    const isFail = (res.status || "").toLowerCase() === "fail";

                    return (
                      <tr key={idx} style={{
                        borderBottom: `1px solid ${themeStyles.cardBorder}`,
                        transition: "background 0.2s",
                        background: idx === 0 && canPublishResult ? "rgba(2, 132, 199, 0.05)" : "transparent"
                      }}>
                        <td style={{ padding: "16px", fontWeight: "800", color: "#0284c7" }}>
                          #{resId}
                          {idx === 0 && canPublishResult && (
                            <span style={{
                              marginLeft: "8px", padding: "2px 8px", background: "#0284c7",
                              color: "white", borderRadius: "6px", fontSize: "10px", fontWeight: "700"
                            }}>
                              LATEST
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{sName}</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                            {(res.studentId || res.student_id || res.student?.student_id) && (
                              <span style={{
                                fontSize: "11px", fontWeight: "700", background: "rgba(99, 102, 241, 0.12)",
                                color: "#6366f1", padding: "2px 6px", borderRadius: "4px"
                              }}>
                                ID #{res.studentId || res.student_id || res.student?.student_id}
                              </span>
                            )}
                            {sRoll && <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>Roll: {sRoll}</span>}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{subName}</div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                            {(res.subjectId || res.subject_id || res.subject?.subject_id) && (
                              <span style={{
                                fontSize: "11px", fontWeight: "700", background: "rgba(2, 132, 199, 0.12)",
                                color: "#0284c7", padding: "2px 6px", borderRadius: "4px"
                              }}>
                                ID #{res.subjectId || res.subject_id || res.subject?.subject_id}
                              </span>
                            )}
                            {res.subjectCode && <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>Code: {res.subjectCode}</span>}
                            {res.courseName && (
                              <span style={{
                                fontSize: "10px", fontWeight: "700", background: "rgba(16, 185, 129, 0.12)",
                                color: "#10b981", padding: "2px 6px", borderRadius: "4px"
                              }}>
                                {res.courseName}
                              </span>
                            )}
                            {res.staffName && (
                              <span style={{
                                fontSize: "10px", fontWeight: "600", background: "rgba(168, 85, 247, 0.12)",
                                color: "#a855f7", padding: "2px 6px", borderRadius: "4px"
                              }}>
                                Prof. {res.staffName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px", fontWeight: "700" }}>{marks} / 100</td>
                        <td style={{ padding: "16px", fontWeight: "800", color: isFail ? "#ef4444" : "#f59e0b" }}>
                          ⭐ {res.grade || "A"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                            background: isFail ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: isFail ? "#ef4444" : "#10b981"
                          }}>
                            {res.status || "Pass"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedResultForMarksheet(res)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                              background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "white",
                              border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "12px",
                              boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
                            }}
                          >
                            <FaFileAlt /> Marksheet PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 📄 UNIVERSITY MARKSHEET MODAL */}
      {selectedResultForMarksheet && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", padding: "30px", maxWidth: "760px", width: "95%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", position: "relative", maxHeight: "95vh", overflowY: "auto"
          }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px", fontWeight: "800" }}>Official Examination Grade Sheet</h3>
              <button onClick={() => setSelectedResultForMarksheet(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            {/* PRINTABLE MARKSHEET CONTAINER */}
            <div id="printable-marksheet" style={{
              background: "#ffffff", border: "3px double #1e293b", padding: "30px",
              color: "#0f172a", boxSizing: "border-box", borderRadius: "12px"
            }}>
              {/* Header */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #1e293b", paddingBottom: "16px", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#1e1b4b", letterSpacing: "0.5px" }}>
                  COLLEGE OF ENGINEERING & TECHNOLOGY
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#475569" }}>
                  Affiliated to State Technological University • Approved by AICTE
                </p>
                <div style={{ display: "inline-block", border: "1px solid #1e293b", padding: "4px 16px", marginTop: "10px", fontWeight: "800", fontSize: "13px", letterSpacing: "1px", background: "#f8fafc" }}>
                  STATEMENT OF MARKS & GRADES
                </div>
              </div>

              {/* Student Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", marginBottom: "20px", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div><strong>Student Name:</strong> {selectedResultForMarksheet.studentName || selectedResultForMarksheet.student_name || selectedResultForMarksheet.student?.student_name || "Student"}</div>
                <div><strong>Roll Number:</strong> {selectedResultForMarksheet.studentRollNo || selectedResultForMarksheet.student?.roll_no || selectedResultForMarksheet.studentId || selectedResultForMarksheet.student?.student_id}</div>
                <div><strong>Academic Year:</strong> 2025 - 2026</div>
                <div><strong>Examination:</strong> Semester End Examination</div>
              </div>

              {/* Subject Wise Marks Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: "#1e293b", color: "#ffffff" }}>
                    <th style={{ padding: "10px", border: "1px solid #1e293b" }}>Subject Code</th>
                    <th style={{ padding: "10px", border: "1px solid #1e293b" }}>Subject Name</th>
                    <th style={{ padding: "10px", border: "1px solid #1e293b" }}>Max Marks</th>
                    <th style={{ padding: "10px", border: "1px solid #1e293b" }}>Marks Obtained</th>
                    <th style={{ padding: "10px", border: "1px solid #1e293b" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1" }}>{selectedResultForMarksheet.subjectCode || `CS-${selectedResultForMarksheet.subjectId || selectedResultForMarksheet.subject?.subject_id || "101"}`}</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1", fontWeight: "600" }}>{selectedResultForMarksheet.subjectName || selectedResultForMarksheet.subject_name || selectedResultForMarksheet.subject?.subject_name || "Core Engineering Subject"}</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1" }}>100</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1", fontWeight: "700" }}>{selectedResultForMarksheet.totalMarks ?? selectedResultForMarksheet.total_marks ?? 0}</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1", fontWeight: "800", color: "#2563eb" }}>{selectedResultForMarksheet.grade || "A"}</td>
                  </tr>
                  <tr style={{ background: "#f8fafc", fontWeight: "700" }}>
                    <td colSpan="2" style={{ padding: "10px", border: "1px solid #cbd5e1", textAlign: "right" }}>GRAND TOTAL:</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1" }}>100</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1" }}>{selectedResultForMarksheet.totalMarks ?? selectedResultForMarksheet.total_marks ?? 0}</td>
                    <td style={{ padding: "10px", border: "1px solid #cbd5e1", color: selectedResultForMarksheet.status === "Fail" ? "#ef4444" : "#10b981" }}>{selectedResultForMarksheet.status || "PASS"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Result Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #1e293b", paddingTop: "12px", marginBottom: "36px", fontSize: "13px" }}>
                <div><strong>PERCENTAGE:</strong> {selectedResultForMarksheet.totalMarks ?? selectedResultForMarksheet.total_marks ?? 0}%</div>
                <div><strong>FINAL RESULT:</strong> <span style={{ color: selectedResultForMarksheet.status === "Fail" ? "#ef4444" : "#10b981", fontWeight: "800" }}>{selectedResultForMarksheet.status === "Fail" ? "FAIL - NEEDS REAPPEAR" : "FIRST CLASS WITH DISTINCTION"}</span></div>
              </div>

              {/* Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #000", width: "140px", marginBottom: "4px" }}></div>
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>Controller of Exams</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ border: "2px dashed #0284c7", borderRadius: "50%", width: "65px", height: "65px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px auto", color: "#0284c7", fontSize: "9px", fontWeight: "800" }}>
                    COLLEGE SEAL
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #000", width: "140px", marginBottom: "4px" }}></div>
                  <span style={{ fontSize: "11px", fontWeight: "700" }}>Principal / Dean</span>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handlePrintMarksheet}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 30px",
                  background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "white",
                  border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(2, 132, 199, 0.4)"
                }}
              >
                <FaPrint /> Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;
