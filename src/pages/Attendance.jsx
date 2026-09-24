import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaIdBadge, FaCalendarAlt, FaSignInAlt,
  FaSignOutAlt, FaArrowLeft, FaSave,
  FaBookOpen, FaUsers, FaSync, FaGraduationCap, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Attendance() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  // Role Mapping from LocalStorage user object (1: HOD, 2: Principal, 3: Professor, 4: Student)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

  const isPrincipal = roleId === 2;
  const isHOD = roleId === 1;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;

  // Helper to get local current date (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [attendanceList, setAttendanceList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userid: "", attendancedate: getTodayDate(), intime: "", outtime: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 🟢 Fetch Context Data (Users, Students, Staff, Courses for Name & Course Lookups)
  const fetchContextData = async () => {
    const headers = getAuthHeaders();
    try {
      const uRes = await axios.get("http://localhost:8080/api/users", { headers }).catch(() => null);
      if (uRes?.data) setUsersList(Array.isArray(uRes.data) ? uRes.data : []);
    } catch {}

    try {
      let sRes = await axios.get("http://localhost:8080/student/all", { headers }).catch(() => null);
      if (!sRes?.data) {
        sRes = await axios.get("http://localhost:8080/api/student", { headers }).catch(() => null);
      }
      if (sRes?.data) setStudentsList(Array.isArray(sRes.data) ? sRes.data : (sRes.data?.content || []));
    } catch {}

    try {
      const stRes = await axios.get("http://localhost:8080/staff/all", { headers }).catch(() => null);
      if (stRes?.data) setStaffList(Array.isArray(stRes.data) ? stRes.data : (stRes.data?.content || []));
    } catch {}

    try {
      let cRes = await axios.get("http://localhost:8080/api/courses/all", { headers }).catch(() => null);
      if (!cRes?.data) {
        cRes = await axios.get("http://localhost:8080/api/courses/lookup", { headers }).catch(() => null);
      }
      if (cRes?.data) setCoursesList(Array.isArray(cRes.data) ? cRes.data : (cRes.data?.content || []));
    } catch {}
  };

  // Helper to extract course IDs from staff object (course_id, course_ids)
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

  // Find the logged-in staff record (for Professor / HOD)
  const currentStaff = useMemo(() => {
    const currentEmail = (user?.emailId || user?.email || "").toLowerCase().trim();
    const currentUserId = Number(user?.user_id || user?.userId || user?.id || 0);

    return staffList.find(st =>
      (currentEmail && st.email && st.email.toLowerCase().trim() === currentEmail) ||
      (currentUserId && Number(st.user_id || st.userId) === currentUserId)
    );
  }, [staffList, user]);

  // Assigned course IDs for the logged-in user
  const assignedCourseIds = useMemo(() => {
    if (isPrincipal) {
      return coursesList.map(c => Number(c.course_id || c.courseId));
    }
    if (isProfessor || isHOD) {
      return getStaffCourseIds(currentStaff);
    }
    return [];
  }, [isPrincipal, isProfessor, isHOD, currentStaff, coursesList]);

  // Professor's assigned courses list
  const professorCourses = useMemo(() => {
    if (isPrincipal) return coursesList;
    if (assignedCourseIds.length > 0) {
      return coursesList.filter(c => assignedCourseIds.includes(Number(c.course_id || c.courseId)));
    }
    return [];
  }, [isPrincipal, assignedCourseIds, coursesList]);

  // Helper to get Course Name by Course ID
  const getCourseName = (cId) => {
    if (!cId) return "Unassigned Course";
    const found = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(cId));
    return found ? (found.course_name || found.courseName) : `Course #${cId}`;
  };

  // 🟢 Resolve student records and map with valid User IDs for backend attendance
  const processedStudents = useMemo(() => {
    return studentsList.map(s => {
      const sCourseId = Number(s.course_id || s.courseId || 0);

      // Resolve valid user_id in user_detail (where role_id == 4)
      let effectiveUserId = null;
      if (s.user_id && usersList.some(u => Number(u.user_id || u.id) === Number(s.user_id) && Number(u.role_id || u.roleId) === 4)) {
        effectiveUserId = Number(s.user_id);
      } else if (s.email) {
        const found = usersList.find(u => u.emailId && u.emailId.toLowerCase().trim() === s.email.toLowerCase().trim() && Number(u.role_id || u.roleId) === 4);
        if (found) effectiveUserId = Number(found.user_id || found.id);
      } else if (s.student_name) {
        const found = usersList.find(u => u.full_name && u.full_name.toLowerCase().trim() === s.student_name.toLowerCase().trim() && Number(u.role_id || u.roleId) === 4);
        if (found) effectiveUserId = Number(found.user_id || found.id);
      }

      if (!effectiveUserId && s.user_id) {
        effectiveUserId = Number(s.user_id);
      }

      const courseObj = coursesList.find(c => Number(c.course_id || c.courseId) === sCourseId);
      const courseName = courseObj ? (courseObj.course_name || courseObj.courseName) : (sCourseId ? `Course #${sCourseId}` : "Unassigned");

      return {
        student_id: s.student_id,
        user_id: effectiveUserId,
        student_name: s.student_name || s.studentName || s.full_name || "Student",
        roll_no: s.roll_no || "-",
        course_id: sCourseId,
        course_name: courseName,
        semester: courseObj?.semester || "",
        email: s.email
      };
    }).filter(s => s.user_id !== null);
  }, [studentsList, usersList, coursesList]);

  // Filter students strictly belonging to Professor's assigned courses!
  const professorEligibleStudents = useMemo(() => {
    if (isPrincipal) {
      return processedStudents;
    }
    if (isProfessor) {
      if (assignedCourseIds.length > 0) {
        return processedStudents.filter(s => assignedCourseIds.includes(s.course_id));
      }
      return [];
    }
    if (isHOD) {
      if (assignedCourseIds.length > 0) {
        return processedStudents.filter(s => assignedCourseIds.includes(s.course_id));
      }
      return processedStudents;
    }
    return processedStudents;
  }, [isPrincipal, isProfessor, isHOD, assignedCourseIds, processedStudents]);

  // Students displayed based on selected course filter
  const displayedStudents = useMemo(() => {
    if (selectedCourseId === "all") {
      return professorEligibleStudents;
    }
    return professorEligibleStudents.filter(s => s.course_id === Number(selectedCourseId));
  }, [selectedCourseId, professorEligibleStudents]);

  // Group students by course for <optgroup> in dropdown
  const studentsGroupedByCourse = useMemo(() => {
    const map = {};
    professorEligibleStudents.forEach(s => {
      const cId = s.course_id;
      const cName = s.course_name;
      if (!map[cId]) {
        map[cId] = {
          courseId: cId,
          courseName: cName,
          semester: s.semester,
          students: []
        };
      }
      map[cId].students.push(s);
    });
    return Object.values(map);
  }, [professorEligibleStudents]);

  // Currently selected student details for display chip
  const selectedStudentDetails = useMemo(() => {
    if (!formData.userid) return null;
    return professorEligibleStudents.find(s => Number(s.user_id) === Number(formData.userid));
  }, [formData.userid, professorEligibleStudents]);

  // Handle course filter change
  const handleCourseChange = (newCourseId) => {
    setSelectedCourseId(newCourseId);
    if (newCourseId !== "all") {
      const numCId = Number(newCourseId);
      if (formData.userid) {
        const studentStillValid = professorEligibleStudents.some(
          s => Number(s.user_id) === Number(formData.userid) && s.course_id === numCId
        );
        if (!studentStillValid) {
          setFormData(prev => ({ ...prev, userid: "" }));
        }
      }
    }
  };

  // 🟢 Resolve User Name by User ID
  const getUserDisplayName = (uid) => {
    if (!uid) return "-";
    const numId = Number(uid);

    // 1. Check in studentsList
    const matchedStudent = studentsList.find(s => Number(s.user_id) === numId || Number(s.student_id) === numId);
    if (matchedStudent && (matchedStudent.student_name || matchedStudent.studentName)) {
      return matchedStudent.student_name || matchedStudent.studentName;
    }

    // 2. Check in usersList
    const matchedUser = usersList.find(u => Number(u.user_id || u.id) === numId);
    if (matchedUser && matchedUser.full_name) {
      return matchedUser.full_name;
    }

    // 3. Check in staffList
    const matchedStaff = staffList.find(st => Number(st.staffid || st.staff_id) === numId || (matchedUser && st.email === matchedUser.emailId));
    if (matchedStaff && matchedStaff.staffname) {
      return matchedStaff.staffname;
    }

    if (matchedUser && matchedUser.emailId) {
      return matchedUser.emailId;
    }

    return `User #${uid}`;
  };

  // 🟢 Get Student's Course Name for Table
  const getStudentCourseName = (uid) => {
    if (!uid) return null;
    const numId = Number(uid);
    const matched = studentsList.find(s => Number(s.user_id) === numId || Number(s.student_id) === numId);
    if (matched && matched.course_id) {
      return getCourseName(matched.course_id);
    }
    return null;
  };

  // 🟢 Resolve Added By to Real Name
  const getAddedByName = (addedByVal) => {
    if (!addedByVal) return "-";
    if (addedByVal.includes("@")) {
      const email = addedByVal.trim().toLowerCase();

      const u = usersList.find(x => x.emailId && x.emailId.trim().toLowerCase() === email);
      if (u && u.full_name) return u.full_name;

      const st = staffList.find(x => x.email && x.email.trim().toLowerCase() === email);
      if (st && st.staffname) return st.staffname;

      const s = studentsList.find(x => x.email && x.email.trim().toLowerCase() === email);
      if (s && (s.student_name || s.studentName)) return s.student_name || s.studentName;

      const prefix = addedByVal.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return addedByVal;
  };

  // 🟢 Fetch Attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/attendance/all", {
        headers: getAuthHeaders(),
      });

      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      data.sort((a, b) => {
        const idA = Number(a.attendanceid || a.attendanceId || 0);
        const idB = Number(b.attendanceid || b.attendanceId || 0);
        return idB - idA;
      });
      setAttendanceList(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchContextData();
  }, []);

  // 🟢 Save Attendance with Strict Date & Time Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userid) {
      alert("Please select a valid student/user!");
      return;
    }

    if (!formData.intime || !formData.outtime) {
      alert("Please enter both In Time and Out Time!");
      return;
    }

    // Strict Out Time > In Time Validation
    if (formData.outtime <= formData.intime) {
      alert(`Invalid Time: Out Time (${formData.outtime}) must be strictly AFTER In Time (${formData.intime})! Please enter a valid later time.`);
      return;
    }

    const dataToSend = {
      userid: parseInt(formData.userid),
      attendancedate: getTodayDate(),
      intime: formData.intime,
      outtime: formData.outtime
    };

    try {
      await axios.post("http://localhost:8080/api/attendance/save", dataToSend, {
        headers: getAuthHeaders(),
      });

      alert("Attendance Saved Successfully for Today!");
      setFormData(prev => ({ ...prev, userid: "", intime: "", outtime: "" }));
      fetchAttendance();
    } catch (error) {
      console.error("Save error:", error);
      const errMsg = error.response?.data || "Error: Data save nahi hua! Console check karein.";
      alert(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
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
    tableHeaderBg: darkMode ? "#111827" : "#f1f5f9",
    iconColor: "#0ea5e9"
  };

  const getSubHeaderTitle = () => {
    if (isPrincipal) return "Manage HOD Attendance & View Complete Directory (Principal Access)";
    if (isHOD) return "Record Professor Attendance & Department Records (HOD Access)";
    if (isProfessor) return "Record Student Attendance for Your Assigned Courses (Professor Access)";
    return "View Your Personal Attendance Records (Student Access)";
  };

  const getFormTitle = () => {
    if (isPrincipal) return "Record HOD Attendance";
    if (isHOD) return "Record Professor Attendance";
    return "Record Student Attendance (By Assigned Course)";
  };

  const getTableTitle = () => {
    if (isPrincipal) return "Complete Attendance Directory (Principal Access)";
    if (isProfessor) return "Attendance Records Marked by You";
    return "My Attendance Records";
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
      <div style={{
        width: "100%",
        maxWidth: "960px",
        background: themeStyles.cardBg,
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: themeStyles.cardShadow,
        border: `1px solid ${themeStyles.cardBorder}`,
        marginBottom: "30px"
      }}>
        {/* Sky-Blue Gradient Header */}
        <div style={{
          background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)",
          padding: "32px 24px",
          color: "#ffffff",
          textAlign: "center",
          position: "relative"
        }}>
          <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Attendance Module
          </h2>
          <p style={{ margin: "6px 0 0 0", opacity: 0.9, fontSize: "14px", fontWeight: "500" }}>
            {getSubHeaderTitle()}
          </p>

          <button
            type="button"
            onClick={() => { fetchContextData(); fetchAttendance(); }}
            title="Refresh Students and Courses"
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              color: "#ffffff",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <FaSync size={12} /> Sync Data
          </button>
        </div>

        {/* Form Body - Visible to Principal, HOD, and Professor */}
        {!isStudent && (
          <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "10px" }}>
                <FaGraduationCap color="#0ea5e9" />
                {getFormTitle()}
              </h3>
            </div>

            {/* 👨‍🏫 PROFESSOR ACCESS: Course Selector & Info Pills */}
            {isProfessor && (
              <div style={{
                background: darkMode ? "rgba(14, 165, 233, 0.08)" : "#f0f9ff",
                border: "1.5px solid rgba(14, 165, 233, 0.25)",
                borderRadius: "16px",
                padding: "18px 20px",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaBookOpen color="#0284c7" size={16} />
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      My Assigned Courses ({professorCourses.length})
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.textSecondary }}>
                    Total Enrolled Students: <strong>{professorEligibleStudents.length}</strong>
                  </span>
                </div>

                {/* Course Quick-Select Pills */}
                {professorCourses.length > 0 ? (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => handleCourseChange("all")}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: selectedCourseId === "all" ? "2px solid #0284c7" : `1px solid ${themeStyles.inputBorder}`,
                        background: selectedCourseId === "all" ? "#0284c7" : themeStyles.cardBg,
                        color: selectedCourseId === "all" ? "#ffffff" : themeStyles.textPrimary,
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>All My Courses</span>
                      <span style={{
                        background: selectedCourseId === "all" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        fontSize: "11px"
                      }}>
                        {professorEligibleStudents.length}
                      </span>
                    </button>

                    {professorCourses.map(c => {
                      const cId = Number(c.course_id || c.courseId);
                      const studentCount = professorEligibleStudents.filter(s => s.course_id === cId).length;
                      const isSelected = selectedCourseId === String(cId);

                      return (
                        <button
                          key={cId}
                          type="button"
                          onClick={() => handleCourseChange(String(cId))}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            border: isSelected ? "2px solid #0284c7" : `1px solid ${themeStyles.inputBorder}`,
                            background: isSelected ? "#0284c7" : themeStyles.cardBg,
                            color: isSelected ? "#ffffff" : themeStyles.textPrimary,
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <span>{c.course_name || c.courseName}</span>
                          <span style={{
                            background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontSize: "11px"
                          }}>
                            {studentCount} Students
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#b45309",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}>
                    <FaExclamationTriangle size={15} />
                    <span>
                      Notice: No courses are currently assigned to your professor profile in Staff Management. Please ask HOD/Admin to assign your courses.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {/* 1. Student / Target User Selection Field */}
              {(() => {
                if (isProfessor) {
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        SELECT STUDENT (FROM YOUR ASSIGNED COURSES) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        name="userid"
                        value={formData.userid}
                        onChange={(e) => setFormData({ ...formData, userid: e.target.value })}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          border: `2px solid ${themeStyles.inputBorder}`,
                          background: themeStyles.inputBg,
                          color: themeStyles.textPrimary,
                          fontSize: "14px",
                          fontWeight: "500",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      >
                        <option value="">
                          {displayedStudents.length === 0
                            ? "-- No Students in Selected Course --"
                            : selectedCourseId === "all"
                            ? "-- Select Student (All Courses) --"
                            : `-- Select Student (${displayedStudents.length} Available) --`}
                        </option>

                        {selectedCourseId !== "all" ? (
                          displayedStudents.map(s => (
                            <option key={`${s.student_id}-${s.user_id}`} value={s.user_id}>
                              [Roll #{s.roll_no}] {s.student_name}
                            </option>
                          ))
                        ) : (
                          studentsGroupedByCourse.map(grp => (
                            <optgroup
                              key={grp.courseId}
                              label={`🎓 ${grp.courseName} (${grp.students.length} Students)`}
                            >
                              {grp.students.map(s => (
                                <option key={`${s.student_id}-${s.user_id}`} value={s.user_id}>
                                  [Roll #{s.roll_no}] {s.student_name}
                                </option>
                              ))}
                            </optgroup>
                          ))
                        )}
                      </select>

                      {/* Selected Student Information Chip */}
                      {selectedStudentDetails ? (
                        <div style={{
                          background: darkMode ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: darkMode ? "#34d399" : "#065f46",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <FaCheckCircle size={13} color="#10b981" />
                          <span>
                            Selected: <strong>{selectedStudentDetails.student_name}</strong> • Roll #{selectedStudentDetails.roll_no} • {selectedStudentDetails.course_name}
                          </span>
                        </div>
                      ) : formData.userid ? (
                        <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "600" }}>
                          Selected: <strong>{getUserDisplayName(formData.userid)}</strong>
                        </span>
                      ) : null}
                    </div>
                  );
                }

                // For Principal (Role 2) or HOD (Role 1)
                const targetRoleId = isPrincipal ? 1 : 3;
                const targetRoleLabel = isPrincipal ? "HOD" : "Professor";
                const eligibleUsers = usersList.filter(u => Number(u.role_id || u.roleId) === targetRoleId);

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Select {targetRoleLabel} <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                      name="userid"
                      value={formData.userid}
                      onChange={(e) => setFormData({ ...formData, userid: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: `2px solid ${themeStyles.inputBorder}`,
                        background: themeStyles.inputBg,
                        color: themeStyles.textPrimary,
                        fontSize: "14px",
                        fontWeight: "500",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    >
                      <option value="">-- Select {targetRoleLabel} --</option>
                      {eligibleUsers.map(u => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.full_name || u.emailId} ({targetRoleLabel})
                        </option>
                      ))}
                    </select>
                    {formData.userid && (
                      <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "600" }}>
                        Selected: <strong>{getUserDisplayName(formData.userid)}</strong>
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Attendance Date: Strictly Auto-Locked to Current Date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>ATTENDANCE DATE <span style={{ color: "#ef4444" }}>*</span></span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", background: "rgba(2, 132, 199, 0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                    🔒 TODAY (CURRENT)
                  </span>
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "14px", color: themeStyles.iconColor, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10 }}>
                    <FaCalendarAlt size={16} />
                  </div>
                  <input
                    type="date"
                    name="attendancedate"
                    value={formData.attendancedate || getTodayDate()}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`,
                      background: darkMode ? "#0b1329" : "#f1f5f9",
                      color: themeStyles.textPrimary,
                      fontSize: "14px",
                      fontWeight: "700",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "not-allowed"
                    }}
                  />
                </div>
                <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                  ✓ Today: {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* In Time */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  IN TIME <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "14px", color: themeStyles.iconColor, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10 }}>
                    <FaSignInAlt size={16} />
                  </div>
                  <input
                    type="time"
                    name="intime"
                    value={formData.intime}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        intime: newIn,
                        outtime: (prev.outtime && prev.outtime <= newIn) ? "" : prev.outtime
                      }));
                    }}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: "12px",
                      border: `2px solid ${themeStyles.inputBorder}`,
                      background: themeStyles.inputBg,
                      color: themeStyles.textPrimary,
                      fontSize: "14px",
                      fontWeight: "700",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                {formData.intime && (
                  <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>
                    In: <strong>{formData.intime}</strong>
                  </span>
                )}
              </div>

              {/* Out Time (Strictly Validated > In Time) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>OUT TIME <span style={{ color: "#ef4444" }}>*</span></span>
                  {formData.intime && (
                    <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "600" }}>
                      Must be after {formData.intime}
                    </span>
                  )}
                </label>
                <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "14px", color: themeStyles.iconColor, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 10 }}>
                    <FaSignOutAlt size={16} />
                  </div>
                  <input
                    type="time"
                    name="outtime"
                    value={formData.outtime}
                    min={formData.intime || undefined}
                    onChange={(e) => {
                      const newOut = e.target.value;
                      if (formData.intime && newOut <= formData.intime) {
                        alert(`Invalid Time: Out Time (${newOut}) cannot be earlier than or equal to In Time (${formData.intime})! Out Time must be later.`);
                        return;
                      }
                      setFormData(prev => ({ ...prev, outtime: newOut }));
                    }}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      borderRadius: "12px",
                      border: `2px solid ${formData.intime && formData.outtime && formData.outtime <= formData.intime ? "#ef4444" : themeStyles.inputBorder}`,
                      background: themeStyles.inputBg,
                      color: themeStyles.textPrimary,
                      fontSize: "14px",
                      fontWeight: "700",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                {formData.intime && formData.outtime && formData.outtime <= formData.intime ? (
                  <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: "700" }}>
                    ⚠️ Out Time must be strictly AFTER In Time ({formData.intime})!
                  </span>
                ) : (
                  formData.outtime && (
                    <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}>
                      ✓ Valid Out Time: <strong>{formData.outtime}</strong>
                    </span>
                  )
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "32px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 36px",
                  background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(14, 165, 233, 0.35)"
                }}
              >
                <FaSave size={14} /> Save Attendance
              </button>
            </div>
          </form>
        )}

        {/* Attendance Directory Table */}
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: themeStyles.textPrimary }}>
              {getTableTitle()}
            </h3>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: "10px 24px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                color: "#475569",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: themeStyles.textPrimary, fontSize: "14px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg, textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>User (ID / Name / Course)</th>
                  <th style={{ padding: "12px" }}>Attendance Date</th>
                  <th style={{ padding: "12px" }}>In Time</th>
                  <th style={{ padding: "12px" }}>Out Time</th>
                  <th style={{ padding: "12px" }}>Added By</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendanceList.length > 0 ? (
                  attendanceList.map((item, idx) => {
                    const uId = item.userid || item.userId;
                    const uName = getUserDisplayName(uId);
                    const courseName = getStudentCourseName(uId);

                    return (
                      <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.inputBorder}` }}>
                        <td style={{ padding: "12px" }}>
                          <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{uName}</div>
                          <div style={{ fontSize: "11px", color: "#0284c7", fontWeight: "600", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                            <span>ID #{uId || "-"}</span>
                            {courseName && (
                              <span style={{
                                background: darkMode ? "rgba(2, 132, 199, 0.2)" : "rgba(2, 132, 199, 0.1)",
                                color: "#0284c7",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontWeight: "700"
                              }}>
                                🎓 {courseName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>{item.attendancedate || item.attendanceDate || "-"}</td>
                        <td style={{ padding: "12px" }}>{item.intime || item.inTime || "-"}</td>
                        <td style={{ padding: "12px" }}>{item.outtime || item.outTime || "-"}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            fontWeight: "700",
                            color: themeStyles.textPrimary,
                            background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                            padding: "4px 10px",
                            borderRadius: "8px"
                          }}>
                            {getAddedByName(item.addedBy)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: themeStyles.textSecondary }}>
                      No attendance records found.
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
}

export default Attendance;