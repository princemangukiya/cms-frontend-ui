import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate, FaPhone, FaEnvelope,
  FaVenusMars, FaCalendarAlt, FaMapMarkerAlt,
  FaArrowLeft, FaSave, FaUsers, FaTimes,
  FaEdit, FaExclamationTriangle
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Student() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const currentUserId = user?.user_id || user?.id || user?.userId;

  // Roles: Role 1 = HOD, Role 2 = Principal, Role 3 = Professor, Role 4 = Student
  const isHod = roleId === 1;
  const isPrincipal = roleId === 2;
  const isProfessor = roleId === 3;
  const isStudent = roleId === 4;
  const canAddStudent = isPrincipal || isHod;

  const [userStaff, setUserStaff] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(false);

  const [student, setStudent] = useState({
    roll_no: "",
    student_name: "",
    email: "",
    mobile_no: "",
    gender: "",
    dob: "",
    admission_date: "",
    status: "Active",
    address: "",
    course_id: "1"
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

  const fetchCourses = async () => {
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/api/courses/lookup", { headers: getAuthHeaders() });
      } catch {
        res = await axios.get("http://localhost:8080/api/courses/all", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCoursesList(data);
    } catch (err) {
      console.error("Error fetching courses in Student:", err);
    }
  };

  const getCourseName = (cId) => {
    if (!cId) return "Not Assigned";
    const found = coursesList.find(c => Number(c.course_id || c.courseId || c.id) === Number(cId));
    return found ? (found.course_name || found.courseName) : `Course #${cId}`;
  };

  // 👔 Real-world college logic:
  // - Principal can register students into ANY course across the college
  // - HOD (Role 1) can ONLY register students into their department's assigned course(s)
  const selectableCoursesForAdd = useMemo(() => {
    if (isPrincipal) return coursesList;
    if (isHod) {
      const hodCourseIds = getStaffCourseIds(userStaff);
      if (hodCourseIds.length > 0) {
        const deptCourses = coursesList.filter(c => hodCourseIds.includes(Number(c.course_id || c.courseId || c.id)));
        return deptCourses.length > 0 ? deptCourses : coursesList;
      }
    }
    return coursesList;
  }, [isPrincipal, isHod, coursesList, userStaff]);

  // Ensure default course_id in registration form matches HOD's assigned department course
  useEffect(() => {
    if (isHod && selectableCoursesForAdd.length > 0) {
      const currentSelected = Number(student.course_id);
      const exists = selectableCoursesForAdd.some(c => Number(c.course_id || c.courseId || c.id) === currentSelected);
      if (!exists) {
        const defaultCourseId = String(selectableCoursesForAdd[0].course_id || selectableCoursesForAdd[0].courseId || selectableCoursesForAdd[0].id);
        setStudent(prev => ({ ...prev, course_id: defaultCourseId }));
      }
    }
  }, [selectableCoursesForAdd, isHod]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      // 1. Resolve Staff Profile for HOD (Role 1) and Professor (Role 3)
      let currentStaff = userStaff;
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
          console.warn("Could not fetch staff profile in Student:", e);
        }
      }

      // 2. Fetch students from API
      let res;
      try {
        res = await axios.get("http://localhost:8080/student/all", { headers });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/student", { headers });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);

      // 3. Role-Based Filtering
      if (isPrincipal) {
        // Principal sees all college students
        setStudentList(data);
      } else if (isProfessor || isHod) {
        // 👔 Real-World College Logic:
        // Professor / HOD strictly sees all students enrolled in their assigned course(s)!
        const staffCourses = getStaffCourseIds(currentStaff);
        if (staffCourses.length > 0) {
          const myCourseStudents = data.filter(s => {
            const sCourseId = Number(s.course_id || s.courseId);
            return sCourseId && staffCourses.includes(sCourseId);
          });
          setStudentList(myCourseStudents);
        } else {
          setStudentList(data);
        }
      } else if (isStudent) {
        // Student: show only self
        const selfStudent = data.filter(s =>
          (user.email && s.email && s.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
          (user.emailId && s.email && s.email.toLowerCase().trim() === user.emailId.toLowerCase().trim()) ||
          (currentUserId && s.user_id && Number(s.user_id) === Number(currentUserId))
        );
        setStudentList(selfStudent.length > 0 ? selfStudent : data.slice(0, 1));
      } else {
        setStudentList(data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_no") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setStudent((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (student.mobile_no && student.mobile_no.length !== 10) {
      alert("Mobile number must be exactly 10 digits!");
      return;
    }

    const payload = {
      ...student,
      course_id: parseInt(student.course_id) || 1,
      user_id: currentUserId ? Number(currentUserId) : null
    };

    try {
      try {
        await axios.post("http://localhost:8080/student", payload, { headers: getAuthHeaders() });
      } catch (e) {
        await axios.post("http://localhost:8080/api/student", payload, { headers: getAuthHeaders() });
      }

      alert("Student Saved Successfully!");
      setStudent({
        roll_no: "",
        student_name: "",
        email: "",
        mobile_no: "",
        gender: "",
        dob: "",
        admission_date: "",
        status: "Active",
        address: "",
        course_id: "1"
      });
      fetchStudents();
    } catch (error) {
      console.error("Error saving student record:", error);
      alert("Error saving student record.");
    }
  };

  const openEditModal = (s) => {
    const cId = s.course_id || s.courseId || 1;
    setEditingStudent({
      student_id: s.student_id || s.id,
      roll_no: s.roll_no || s.rollNo || "",
      student_name: s.student_name || s.studentName || "",
      email: s.email || "",
      mobile_no: s.mobile_no || s.mobileNo || "",
      gender: s.gender || "Male",
      dob: s.dob || "",
      admission_date: s.admission_date || s.admissionDate || "",
      status: s.status || "Active",
      address: s.address || "",
      course_id: String(cId),
      initial_course_id: cId
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile_no") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setEditingStudent((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }
    setEditingStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (editingStudent.mobile_no && editingStudent.mobile_no.length !== 10) {
      alert("Mobile number must be exactly 10 digits!");
      return;
    }

    setUpdatingStudent(true);
    const payload = {
      ...editingStudent,
      course_id: parseInt(editingStudent.course_id) || 1
    };

    try {
      try {
        await axios.put(`http://localhost:8080/student/${editingStudent.student_id}`, payload, { headers: getAuthHeaders() });
      } catch (e) {
        await axios.put(`http://localhost:8080/api/student/${editingStudent.student_id}`, payload, { headers: getAuthHeaders() });
      }

      alert("Student Details & Enrolled Program Updated Successfully!");
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("Error updating student:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update student.";
      alert(`Error: ${msg}`);
    } finally {
      setUpdatingStudent(false);
    }
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
          #printable-id-card, #printable-id-card * { visibility: visible; }
          #printable-id-card {
            position: fixed; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "1350px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Top Header Card */}
        <div style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
          borderRadius: "24px", padding: "30px 36px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 12px 30px rgba(99, 102, 241, 0.3)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaUserGraduate size={26} />
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Student Management</h1>
            </div>
            <p style={{ margin: "6px 0 0 48px", opacity: 0.9, fontSize: "14px" }}>
              {isPrincipal
                ? "Principal View: All College Students Directory"
                : isProfessor
                ? `👨‍🏫 Faculty Assigned Students — Showing students enrolled in your assigned program(s): ${getStaffCourseIds(userStaff).map(id => getCourseName(id)).join(", ") || "Assigned Courses"}`
                : isHod
                ? `🏛️ Department Students Directory — Courses: ${getStaffCourseIds(userStaff).map(id => getCourseName(id)).join(", ") || "Department Courses"}`
                : "My Student Profile"}
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

        {/* ADD STUDENT FORM */}
        {canAddStudent && (
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "36px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
          }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
              Register New Student
            </h3>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>ROLL NUMBER *</label>
                  <input name="roll_no" value={student.roll_no} onChange={handleChange} placeholder="e.g. CS-101" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STUDENT FULL NAME *</label>
                  <input name="student_name" value={student.student_name} onChange={handleChange} placeholder="Enter full name" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>EMAIL ADDRESS *</label>
                  <input type="email" name="email" value={student.email} onChange={handleChange} placeholder="student@college.edu" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>MOBILE NUMBER (10 DIGITS) *</label>
                  <input type="tel" name="mobile_no" value={student.mobile_no} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>GENDER *</label>
                  <select name="gender" value={student.gender} onChange={handleChange} required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>DATE OF BIRTH</label>
                  <input type="date" name="dob" value={student.dob} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>ADMISSION DATE</label>
                  <input type="date" name="admission_date" value={student.admission_date} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STATUS</label>
                  <select name="status" value={student.status} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#6366f1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>ENROLLED DEGREE / COURSE PROGRAM *</span>
                    {isHod && (
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>
                        🔒 Department Only ({selectableCoursesForAdd.length} Assigned)
                      </span>
                    )}
                    {isPrincipal && (
                      <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>
                        🏛️ Principal: All Courses
                      </span>
                    )}
                  </label>
                  <select
                    name="course_id"
                    value={student.course_id}
                    onChange={handleChange}
                    required
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid #6366f1`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontWeight: "700" }}
                  >
                    {selectableCoursesForAdd.map((c, idx) => {
                      const id = c.course_id || c.courseId || c.id;
                      const name = c.course_name || c.courseName;
                      const sem = c.semester || "Semester 1";
                      return (
                        <option key={idx} value={id}>
                          {name} ({sem})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>FULL RESIDENTIAL ADDRESS</label>
                  <input name="address" value={student.address} onChange={handleChange} placeholder="Enter complete address, city, state" style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "28px" }}>
                <button type="submit" style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "14px 36px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white",
                  border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: "700",
                  boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)"
                }}>
                  <FaSave /> Save Student Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STUDENT DIRECTORY TABLE */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "24px", padding: "32px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <FaUsers color="#6366f1" size={20} />
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
                {isPrincipal
                  ? `All College Students Directory (${studentList.length} Total)`
                  : isProfessor
                  ? `My Assigned Course Students (${studentList.length} Enrolled)`
                  : isHod
                  ? `Department Enrolled Students (${studentList.length} Enrolled)`
                  : `My Student Profile`}
              </h3>
              {(isProfessor || isHod) && getStaffCourseIds(userStaff).length > 0 && (
                <span style={{
                  fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "12px",
                  background: isProfessor ? "rgba(99, 102, 241, 0.15)" : "rgba(2, 132, 199, 0.15)",
                  color: isProfessor ? "#6366f1" : "#0284c7"
                }}>
                  📚 Enrolled in: {getStaffCourseIds(userStaff).map(id => getCourseName(id)).join(", ")}
                </span>
              )}
            </div>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", color: themeStyles.textPrimary, minWidth: "1150px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg }}>
                  <th style={{ padding: "16px" }}>Roll No</th>
                  <th style={{ padding: "16px" }}>Student Name</th>
                  <th style={{ padding: "16px" }}>Enrolled Course / Branch</th>
                  <th style={{ padding: "16px" }}>Mobile</th>
                  <th style={{ padding: "16px" }}>Email</th>
                  <th style={{ padding: "16px" }}>Gender</th>
                  <th style={{ padding: "16px" }}>DOB</th>
                  <th style={{ padding: "16px" }}>Admission Date</th>
                  <th style={{ padding: "16px" }}>Status</th>
                  <th style={{ padding: "16px" }}>Address</th>
                  <th style={{ padding: "16px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "28px" }}>Loading students records...</td></tr>
                ) : studentList.length === 0 ? (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "28px", color: themeStyles.textSecondary }}>No student records found.</td></tr>
                ) : (
                  studentList.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.cardBorder}`, transition: "background 0.2s" }}>
                      <td style={{ padding: "16px", fontWeight: "700", color: "#6366f1" }}>{s.roll_no || s.rollNo || "-"}</td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: "700", color: themeStyles.textPrimary }}>{s.student_name || s.studentName}</div>
                        {(s.student_id || s.id) && (
                          <span style={{
                            display: "inline-block", marginTop: "2px", fontSize: "11px", fontWeight: "700",
                            background: "rgba(99, 102, 241, 0.12)", color: "#6366f1",
                            padding: "2px 6px", borderRadius: "4px"
                          }}>
                            ID #{s.student_id || s.id}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          background: "rgba(99, 102, 241, 0.12)", color: "#6366f1",
                          padding: "6px 14px", borderRadius: "10px", fontWeight: "700", fontSize: "12px",
                          whiteSpace: "nowrap", border: "1px solid rgba(99, 102, 241, 0.25)"
                        }}>
                          🎓 {getCourseName(s.course_id || s.courseId)}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{s.mobile_no || s.mobileNo || "-"}</td>
                      <td style={{ padding: "16px" }}>{s.email}</td>
                      <td style={{ padding: "16px" }}>{s.gender || "-"}</td>
                      <td style={{ padding: "16px" }}>{s.dob || "-"}</td>
                      <td style={{ padding: "16px" }}>{s.admission_date || s.admissionDate || "-"}</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                          background: s.status === "Inactive" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          color: s.status === "Inactive" ? "#ef4444" : "#10b981"
                        }}>
                          {s.status || "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.address || "-"}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                          {(isPrincipal || isHod) && (
                            <button
                              type="button"
                              onClick={() => openEditModal(s)}
                              title="Edit Student & Program"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                                background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "white",
                                border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "12px",
                                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)", transition: "transform 0.15s ease"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                              onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            >
                              <FaEdit /> Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ✏️ EDIT STUDENT & PROGRAM MODAL */}
      {editingStudent && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          padding: "20px", boxSizing: "border-box"
        }}>
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "32px",
            maxWidth: "750px", width: "100%", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${themeStyles.cardBorder}`,
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "rgba(2, 132, 199, 0.15)", padding: "10px", borderRadius: "12px", color: "#0284c7" }}>
                  <FaEdit size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: themeStyles.textPrimary, fontSize: "18px", fontWeight: "800" }}>
                    Edit Student & Program
                  </h3>
                  <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                    ID #{editingStudent.student_id} • {editingStudent.student_name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                style={{
                  background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444",
                  borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontWeight: "700"
                }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} autoComplete="off">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                {/* Roll No */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>ROLL NUMBER *</label>
                  <input
                    name="roll_no"
                    value={editingStudent.roll_no}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STUDENT FULL NAME *</label>
                  <input
                    name="student_name"
                    value={editingStudent.student_name}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    name="email"
                    value={editingStudent.email}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Mobile */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>MOBILE NUMBER (10 DIGITS) *</label>
                  <input
                    type="tel"
                    name="mobile_no"
                    value={editingStudent.mobile_no}
                    onChange={handleEditChange}
                    maxLength={10}
                    required
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Gender */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>GENDER *</label>
                  <select
                    name="gender"
                    value={editingStudent.gender}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* DOB */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>DATE OF BIRTH</label>
                  <input
                    type="date"
                    name="dob"
                    value={editingStudent.dob}
                    onChange={handleEditChange}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Admission Date */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>ADMISSION DATE</label>
                  <input
                    type="date"
                    name="admission_date"
                    value={editingStudent.admission_date}
                    onChange={handleEditChange}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>

                {/* Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STATUS</label>
                  <select
                    name="status"
                    value={editingStudent.status}
                    onChange={handleEditChange}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>

                {/* 🎓 ENROLLED PROGRAM / COURSE SELECTION (The Core Requirement!) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "800", color: "#0284c7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>ENROLLED DEGREE / COURSE PROGRAM *</span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                      Current: {getCourseName(editingStudent.initial_course_id)}
                    </span>
                  </label>
                  <select
                    name="course_id"
                    value={editingStudent.course_id}
                    onChange={handleEditChange}
                    required
                    style={{
                      padding: "12px 16px", borderRadius: "12px", border: "2px solid #0284c7",
                      background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none",
                      fontSize: "14px", fontWeight: "700"
                    }}
                  >
                    {coursesList.map((c, idx) => {
                      const id = c.course_id || c.courseId || c.id;
                      const name = c.course_name || c.courseName;
                      const sem = c.semester || "Semester 1";
                      return (
                        <option key={idx} value={id}>
                          {name} ({sem})
                        </option>
                      );
                    })}
                  </select>

                  {Number(editingStudent.course_id) !== Number(editingStudent.initial_course_id) && (
                    <div style={{
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1.5px solid rgba(245, 158, 11, 0.3)",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      color: "#f59e0b",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginTop: "6px"
                    }}>
                      <FaExclamationTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div><strong>Program Change Notice:</strong></div>
                        <div style={{ marginTop: "2px", fontWeight: "500", opacity: 0.9 }}>
                          Changing program from <strong>{getCourseName(editingStudent.initial_course_id)}</strong> to <strong>{getCourseName(editingStudent.course_id)}</strong> will automatically transition the student's syllabus/subjects to the new course and clean up older course exam records.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>FULL RESIDENTIAL ADDRESS</label>
                  <input
                    name="address"
                    value={editingStudent.address}
                    onChange={handleEditChange}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  style={{
                    padding: "12px 20px", borderRadius: "12px", border: `1px solid ${themeStyles.cardBorder}`,
                    background: "transparent", color: themeStyles.textSecondary, cursor: "pointer", fontWeight: "700"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStudent}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px",
                    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "white",
                    border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "700",
                    boxShadow: "0 8px 20px rgba(2, 132, 199, 0.4)", opacity: updatingStudent ? 0.7 : 1
                  }}
                >
                  <FaSave /> {updatingStudent ? "Updating..." : "Update Student & Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Student;