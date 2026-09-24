import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap, FaBook, FaFileAlt,
  FaCalendarAlt, FaClock, FaArrowLeft, FaSave,
  FaDoorOpen, FaAward, FaTrash, FaFilter, FaCalendarCheck
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const Exam = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // Real-Life College RBAC:
  // Role 2 = Principal -> ONLY role with authority to setup/schedule/modify/delete exams across all courses.
  // Role 1 = HOD -> View-only access, strictly isolated to their assigned department course.
  // Role 3 = Professor -> View-only access, strictly isolated to their assigned department course.
  // Role 4 = Student -> View-only access, strictly isolated to their enrolled course.
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const isPrincipal = roleId === 2;
  const isHOD = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  const canAddEdit = isPrincipal;

  const [examList, setExamList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseFilter, setCourseFilter] = useState("ALL");

  const standardExamTypes = [
    "Final Semester Examination",
    "Mid-Term Examination",
    "Practical / Lab / Viva Exam",
    "Unit Test / Assessment",
    "Backlog / Supplementary Exam"
  ];

  const [exam, setExam] = useState({
    course_id: '',
    exam_type: 'Final Semester Examination',
    exam_start_date: '',
    exam_start_time: '',
    exam_end_time: '',
    subject_id: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
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
      if (cRes?.data) {
        const list = Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || []);
        setCoursesList(list);
        if (list.length === 1) {
          setExam(prev => ({
            ...prev,
            course_id: String(list[0].course_id || list[0].id || '')
          }));
        }
      }
    } catch {}

    try {
      let sRes;
      try {
        sRes = await axios.get("http://localhost:8080/subjects/all", { headers });
      } catch {
        sRes = await axios.get("http://localhost:8080/api/subjects/all", { headers });
      }
      if (sRes?.data) setSubjectsList(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []));
    } catch {}
  };

  const getCourseDisplayName = (cId, item = null) => {
    if (item && (item.course_name || item.courseName)) {
      return item.course_name || item.courseName;
    }
    if (!cId) return "-";
    const c = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(cId));
    if (c && (c.course_name || c.courseName)) {
      return c.course_name || c.courseName;
    }
    return `Course #${cId}`;
  };

  const getSubjectDisplayName = (sId, item = null) => {
    if (item && (item.subject_name || item.subjectName)) {
      return item.subject_name || item.subjectName;
    }
    if (!sId) return "-";
    const s = subjectsList.find(item => Number(item.subject_id || item.subjectId || item.id) === Number(sId));
    if (s && (s.subjectName || s.subject_name)) {
      return `${s.subjectName || s.subject_name} ${s.subjectCode ? `(${s.subjectCode})` : ''}`;
    }
    return `Subject #${sId}`;
  };

  const fetchExams = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/exam/all", {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/exams", {
          headers: getAuthHeaders(),
        });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      const sorted = [...data].sort((a, b) => Number(b.exam_id || b.id || 0) - Number(a.exam_id || a.id || 0));
      setExamList(sorted);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchContextData();
  }, []);

  const handleChange = (e) => setExam({ ...exam, [e.target.name]: e.target.value });

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    setExam(prev => {
      // If currently selected subject does not belong to new course, clear subject_id
      const subjectStillValid = subjectsList.some(s =>
        Number(s.subject_id || s.id) === Number(prev.subject_id) &&
        (!s.courseId && !s.course_id || Number(s.courseId || s.course_id) === Number(selectedCourseId))
      );
      return {
        ...prev,
        course_id: selectedCourseId,
        subject_id: subjectStillValid ? prev.subject_id : ''
      };
    });
  };

  const getSubjectCountForCourse = (cId) => {
    if (!cId) return 0;
    return subjectsList.filter(s => {
      const subCourseId = s.courseId ?? s.course_id;
      return Number(subCourseId) === Number(cId);
    }).length;
  };

  const handleSubjectChange = (e) => {
    const selectedSubId = e.target.value;
    if (!selectedSubId) {
      setExam(prev => ({ ...prev, subject_id: '' }));
      return;
    }
    const found = subjectsList.find(s => Number(s.subject_id || s.id) === Number(selectedSubId));
    setExam(prev => {
      const subCourseId = found ? (found.courseId || found.course_id) : null;
      return {
        ...prev,
        subject_id: selectedSubId,
        course_id: prev.course_id ? prev.course_id : (subCourseId ? String(subCourseId) : prev.course_id)
      };
    });
  };

  // Filter subjects strictly for the currently selected course in the form
  const availableSubjects = exam.course_id
    ? subjectsList.filter(s => {
        const cId = s.courseId ?? s.course_id;
        return !cId || Number(cId) === Number(exam.course_id);
      })
    : subjectsList;

  // Real-life isolation & principal course filter
  const userCourseIds = coursesList.map(c => Number(c.course_id || c.courseId || c.id)).filter(Boolean);

  const displayedExams = examList.filter(item => {
    const itemCourseId = Number(item.course_id || item.courseId);

    // 1. Principal view: filter by selected dropdown filter if not 'ALL'
    if (isPrincipal) {
      if (courseFilter !== "ALL" && Number(courseFilter) !== itemCourseId) {
        return false;
      }
      return true;
    }

    // 2. Non-Principal views (HOD, Professor, Student): Strictly isolate to user's assigned course(s)
    if (userCourseIds.length > 0) {
      return userCourseIds.includes(itemCourseId);
    }
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPrincipal) {
      alert("Unauthorized: Only the Principal has permission to setup examination schedules.");
      return;
    }

    try {
      try {
        await axios.post('http://localhost:8080/exam/add', exam, {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        await axios.post('http://localhost:8080/api/exams', exam, {
          headers: getAuthHeaders(),
        });
      }
      alert("Examination schedule published successfully!");
      setExam({
        course_id: '',
        exam_type: 'Final Semester Examination',
        exam_start_date: '',
        exam_start_time: '',
        exam_end_time: '',
        subject_id: ''
      });
      fetchExams();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!isPrincipal) return;
    if (!window.confirm("Are you sure you want to cancel and delete this examination schedule?")) return;

    try {
      await axios.delete(`http://localhost:8080/exam/${examId}`, {
        headers: getAuthHeaders()
      });
      alert("Examination schedule deleted successfully!");
      fetchExams();
    } catch (err) {
      alert("Failed to delete exam: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const getStatusBadge = (examDateStr) => {
    if (!examDateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    if (examDateStr > today) {
      return (
        <span style={{
          padding: "3px 8px", borderRadius: "12px",
          background: darkMode ? "rgba(16, 185, 129, 0.2)" : "#d1fae5",
          color: darkMode ? "#34d399" : "#065f46",
          fontSize: "11px", fontWeight: "700"
        }}>
          Upcoming
        </span>
      );
    } else if (examDateStr === today) {
      return (
        <span style={{
          padding: "3px 8px", borderRadius: "12px",
          background: darkMode ? "rgba(239, 68, 68, 0.2)" : "#fee2e2",
          color: darkMode ? "#f87171" : "#991b1b",
          fontSize: "11px", fontWeight: "700"
        }}>
          Today
        </span>
      );
    } else {
      return (
        <span style={{
          padding: "3px 8px", borderRadius: "12px",
          background: darkMode ? "rgba(148, 163, 184, 0.2)" : "#e2e8f0",
          color: darkMode ? "#94a3b8" : "#475569",
          fontSize: "11px", fontWeight: "600"
        }}>
          Conducted
        </span>
      );
    }
  };

  const getExamTypeBadge = (type) => {
    const t = String(type || '').toLowerCase();
    let bg = darkMode ? "rgba(139, 92, 246, 0.2)" : "#ede9fe";
    let color = darkMode ? "#c4b5fd" : "#6d28d9";

    if (t.includes("mid")) {
      bg = darkMode ? "rgba(59, 130, 246, 0.2)" : "#dbeafe";
      color = darkMode ? "#93c5fd" : "#1d4ed8";
    } else if (t.includes("practical") || t.includes("viva") || t.includes("lab")) {
      bg = darkMode ? "rgba(20, 184, 166, 0.2)" : "#ccfbf1";
      color = darkMode ? "#5eead4" : "#0f766e";
    } else if (t.includes("unit") || t.includes("assessment")) {
      bg = darkMode ? "rgba(245, 158, 11, 0.2)" : "#fef3c7";
      color = darkMode ? "#fcd34d" : "#b45309";
    } else if (t.includes("backlog")) {
      bg = darkMode ? "rgba(239, 68, 68, 0.2)" : "#fee2e2";
      color = darkMode ? "#fca5a5" : "#b91c1c";
    }

    return (
      <span style={{
        padding: "4px 10px", borderRadius: "8px",
        background: bg, color: color,
        fontSize: "12px", fontWeight: "700", letterSpacing: "0.2px"
      }}>
        {type || "General Exam"}
      </span>
    );
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
    iconColor: "#8b5cf6"
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
            value={exam[name]}
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
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: themeStyles.pageBg,
      padding: "30px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1060px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Real-Life Role Specific Header Banner */}
        <div style={{
          background: isPrincipal
            ? "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #6366f1 100%)"
            : isHOD
              ? "linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0284c7 100%)"
              : isProfessor
                ? "linear-gradient(135deg, #14532d 0%, #15803d 50%, #22c55e 100%)"
                : "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #8b5cf6 100%)",
          padding: "36px 32px",
          color: "#ffffff",
          position: "relative"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.2)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                {isPrincipal ? "Institutional Controller of Examinations" : isHOD ? "Head of Department (HOD) Portal" : isProfessor ? "Faculty & Invigilation Portal" : "Student Examination Schedule"}
              </div>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                {isPrincipal ? "College Examination Controller" : "Examination Timetable Directory"}
              </h2>
              <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500", maxWidth: "600px" }}>
                {isPrincipal
                  ? "Schedule, manage, and supervise institutional examination timetables, seating halls, and total marks across all college departments."
                  : isHOD
                    ? `Official department examination timetable for ${coursesList[0]?.course_name || 'your department'}. View timings, exam halls, and subject dates.`
                    : isProfessor
                      ? `Faculty exam invigilation and timetable schedule for ${coursesList[0]?.course_name || 'your department'}.`
                      : `Official exam schedule for your enrolled course: ${coursesList[0]?.course_name || 'Enrolled Course'}. Keep note of your exam hall and timings.`}
              </p>
            </div>

            {/* Department Badge */}
            {coursesList.length > 0 && !isPrincipal && (
              <div style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                padding: "12px 18px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                textAlign: "right"
              }}>
                <div style={{ fontSize: "11px", opacity: 0.8, fontWeight: "600", textTransform: "uppercase" }}>
                  Assigned Department
                </div>
                <div style={{ fontSize: "16px", fontWeight: "800" }}>
                  {coursesList[0]?.course_name || coursesList[0]?.courseName}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>
                  Course ID #{coursesList[0]?.course_id || coursesList[0]?.id}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real-Life Setup Form: STRICTLY EXCLUSIVE TO PRINCIPAL (Role 2) */}
        {canAddEdit && (
          <form onSubmit={handleSubmit} style={{ padding: "32px", borderBottom: `1px solid ${themeStyles.cardBorder}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  Schedule New College Examination
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: themeStyles.textSecondary }}>
                  Enter examination details, assign hall/classroom, and publish schedule for the selected course.
                </p>
              </div>
              <span style={{
                padding: "4px 12px", borderRadius: "12px",
                background: "#e0e7ff", color: "#3730a3",
                fontSize: "12px", fontWeight: "700"
              }}>
                Principal Exclusive
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Course Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Department / Course <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {coursesList.length > 0 ? (
                  <select
                    name="course_id"
                    value={exam.course_id}
                    onChange={handleCourseChange}
                    required
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                      color: themeStyles.textPrimary, fontSize: "14px", outline: "none", cursor: "pointer"
                    }}
                  >
                    <option value="">-- Select Department / Course --</option>
                    {coursesList.map(c => {
                      const cId = c.course_id || c.id;
                      const count = getSubjectCountForCourse(cId);
                      return (
                        <option key={cId} value={cId}>
                          {c.course_name || c.courseName} ({count} {count === 1 ? 'Subject' : 'Subjects'})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  renderInputField("Course ID", "course_id", "Enter Course ID", FaGraduationCap, "number", true)
                )}
                {exam.course_id && (
                  <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600" }}>
                    Selected: <strong>{getCourseDisplayName(exam.course_id)}</strong>
                  </span>
                )}
              </div>

              {/* Dynamic Subject Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Subject (Name & Code) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  {exam.course_id && (
                    <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>
                      {availableSubjects.length} {availableSubjects.length === 1 ? 'Subject' : 'Subjects'} in {getCourseDisplayName(exam.course_id)}
                    </span>
                  )}
                </div>

                <select
                  name="subject_id"
                  value={exam.subject_id}
                  onChange={handleSubjectChange}
                  required
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: "12px",
                    border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                    color: themeStyles.textPrimary, fontSize: "14px", outline: "none", cursor: "pointer"
                  }}
                >
                  {exam.course_id ? (
                    availableSubjects.length > 0 ? (
                      <>
                        <option value="">-- Select Subject ({availableSubjects.length} Available in {getCourseDisplayName(exam.course_id)}) --</option>
                        {availableSubjects.map(s => (
                          <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                            {s.subjectName || s.subject_name} {s.subjectCode ? `(${s.subjectCode})` : ''}
                          </option>
                        ))}
                      </>
                    ) : (
                      <>
                        <option value="">-- No subjects found in {getCourseDisplayName(exam.course_id)} (0 in Database) --</option>
                        <optgroup label="Or choose from other registered subjects">
                          {subjectsList.map(s => (
                            <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                              {s.subjectName || s.subject_name} ({getCourseDisplayName(s.courseId || s.course_id)})
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )
                  ) : (
                    <>
                      <option value="">-- Select Subject ({subjectsList.length} Total Subjects) --</option>
                      {subjectsList.map(s => (
                        <option key={s.subject_id || s.id} value={s.subject_id || s.id}>
                          {s.subjectName || s.subject_name} ({getCourseDisplayName(s.courseId || s.course_id)})
                        </option>
                      ))}
                    </>
                  )}
                </select>

                {exam.course_id && availableSubjects.length === 0 && (
                  <div style={{
                    padding: "8px 12px", borderRadius: "8px",
                    background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#b45309", fontSize: "12px", fontWeight: "600", marginTop: "2px"
                  }}>
                    ⚠️ {getCourseDisplayName(exam.course_id)} ke liye database me abhi tak koi subject add nahi hua hai. Aap "Subject" page par jakar BCA ke subjects add kar sakte hain ya all subjects me se choose kar sakte hain.
                  </div>
                )}

                {exam.subject_id && (
                  <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                    Selected: <strong>{getSubjectDisplayName(exam.subject_id)}</strong>
                  </span>
                )}
              </div>

              {/* Standardized Exam Type Dropdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Examination Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <select
                    name="exam_type"
                    value={exam.exam_type}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg,
                      color: themeStyles.textPrimary, fontSize: "14px", outline: "none", cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    {standardExamTypes.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Date */}
              {renderInputField("Exam Date", "exam_start_date", "", FaCalendarAlt, "date", true)}

              {/* Timings */}
              {renderInputField("Start Time", "exam_start_time", "", FaClock, "time", true)}
              {renderInputField("End Time", "exam_end_time", "", FaClock, "time", true)}
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "28px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "14px 40px",
                  background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)",
                  transition: "transform 0.15s ease"
                }}
              >
                <FaCalendarCheck size={16} /> Publish & Schedule Exam
              </button>
            </div>
          </form>
        )}

        {/* Exam Schedule Directory Table */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                Examination Timetable
              </h3>
              <span style={{
                padding: "2px 10px", borderRadius: "12px",
                background: themeStyles.tableHeaderBg, color: themeStyles.textSecondary,
                fontSize: "12px", fontWeight: "700"
              }}>
                {displayedExams.length} Scheduled
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* Course Filter Dropdown - Available to Principal to switch views */}
              {isPrincipal && coursesList.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaFilter size={13} color={themeStyles.textSecondary} />
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: `1px solid ${themeStyles.inputBorder}`,
                      background: themeStyles.inputBg,
                      color: themeStyles.textPrimary,
                      fontSize: "13px",
                      fontWeight: "600",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="ALL">All Departments ({coursesList.length})</option>
                    {coursesList.map(c => (
                      <option key={c.course_id || c.id} value={c.course_id || c.id}>
                        {c.course_name || c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: "9px 20px",
                  background: darkMode ? "#334155" : "#f1f5f9",
                  border: `1px solid ${themeStyles.inputBorder}`,
                  color: themeStyles.textPrimary,
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaArrowLeft size={13} /> Dashboard
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "14px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left" }}>
                  <th style={{ padding: "12px 14px", borderRadius: "8px 0 0 8px" }}>Exam Type</th>
                  <th style={{ padding: "12px 14px" }}>Course / Department</th>
                  <th style={{ padding: "12px 14px" }}>Subject</th>
                  <th style={{ padding: "12px 14px" }}>Date & Status</th>
                  <th style={{ padding: "12px 14px" }}>Timing</th>
                  {isPrincipal && <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 8px 8px 0" }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isPrincipal ? 6 : 5} style={{ padding: "30px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading examination timetable...
                    </td>
                  </tr>
                ) : displayedExams.length > 0 ? (
                  displayedExams.map((item, idx) => {
                    const cId = item.course_id || item.courseId;
                    const subId = item.subject_id || item.subjectId;
                    const examId = item.exam_id || item.id;

                    return (
                      <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.inputBorder}` }}>
                        <td style={{ padding: "14px" }}>
                          {getExamTypeBadge(item.exam_type || item.examType)}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                            {item.course_name || item.courseName || getCourseDisplayName(cId, item)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6366f1", fontWeight: "600" }}>Course ID #{cId || "-"}</div>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>
                            {item.subject_name || item.subjectName || getSubjectDisplayName(subId, item)}
                          </div>
                          <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>Subject ID #{subId || "-"}</div>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: "600" }}>
                            {item.exam_start_date || item.exam_date || item.examDate || item.startDate || "-"}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            {getStatusBadge(item.exam_start_date || item.exam_date || item.examDate)}
                          </div>
                        </td>
                        <td style={{ padding: "14px", fontWeight: "600", fontSize: "13px" }}>
                          {(item.exam_start_time || item.start_time || item.startTime || "--") +
                           " - " +
                           (item.exam_end_time || item.end_time || item.endTime || "--")}
                        </td>
                        {isPrincipal && (
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteExam(examId)}
                              title="Delete Exam Schedule"
                              style={{
                                padding: "8px 12px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.25)",
                                color: "#ef4444",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "700",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                transition: "all 0.15s ease"
                              }}
                            >
                              <FaTrash size={12} /> Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isPrincipal ? 8 : 7} style={{ padding: "30px", textAlign: "center", color: themeStyles.textSecondary }}>
                      {isPrincipal
                        ? "No examination schedules found. Click 'Publish & Schedule Exam' to create one."
                        : `No exam timetable announced yet for ${coursesList[0]?.course_name || 'your department'}.`}
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

export default Exam;