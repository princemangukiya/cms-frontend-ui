import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie, FaPhone, FaEnvelope, FaBriefcase,
  FaMapMarkerAlt, FaMoneyBillWave, FaArrowLeft, FaSave, FaUsers,
  FaEdit, FaTrashAlt, FaTimes, FaCheck, FaGraduationCap, FaPlus
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Staff() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
  const loggedInEmail = user?.emailId || user?.email || "";

  // Role 1 = HOD, Role 2 = Principal (Can Add & Manage Staff)
  const canManageStaff = roleId === 1 || roleId === 2;
  const isPrincipal = roleId === 2;
  const isProfessor = roleId === 3;

  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [staff, setStaff] = useState({
    staffname: "",
    designation: "",
    mobileno: "",
    email: "",
    gender: "",
    dob: "",
    joiningdate: "",
    salary: "",
    address: "",
    course_id: ""
  });

  const [addStaffCourseIds, setAddStaffCourseIds] = useState([]);
  const [addCourseToAdd, setAddCourseToAdd] = useState("");

  const [editFormData, setEditFormData] = useState({
    staffname: "",
    designation: "",
    mobileno: "",
    email: "",
    gender: "",
    dob: "",
    joiningdate: "",
    salary: "",
    address: "",
    course_id: "",
    courseIds: []
  });
  const [editCourseToAdd, setEditCourseToAdd] = useState("");

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
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/courses/all", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses for staff:", err);
    }
  };

  // 🏛️ Real-world college logic: HOD assigns only courses under their department; Principal assigns any college course
  const myStaffRecord = useMemo(() => {
    return staffList.find(st => (st.email || "").toLowerCase().trim() === loggedInEmail.toLowerCase().trim() || (user?.user_id && Number(st.user_id) === Number(user.user_id)));
  }, [staffList, loggedInEmail, user]);

  const hodMyCourseIds = useMemo(() => {
    return isPrincipal ? [] : getStaffCourseIds(myStaffRecord);
  }, [isPrincipal, myStaffRecord]);

  const assignableCourses = useMemo(() => {
    if (isPrincipal) return courses;
    if (roleId === 1 && hodMyCourseIds.length > 0) {
      return courses.filter(c => hodMyCourseIds.includes(Number(c.course_id || c.courseId || c.id)));
    }
    return courses;
  }, [isPrincipal, roleId, hodMyCourseIds, courses]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/staff/all", { headers: getAuthHeaders() });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/staff", { headers: getAuthHeaders() });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);

      // 🔒 Role-Based Staff Isolation:
      if (isPrincipal) {
        // Principal sees all staff members across the college
        setStaffList(data);
      } else if (isProfessor) {
        // Professor sees only his/her own profile
        const selfStaff = data.filter(st => (st.email || "").toLowerCase().trim() === loggedInEmail.toLowerCase().trim());
        setStaffList(selfStaff.length > 0 ? selfStaff : data.slice(0, 1));
      } else if (roleId === 1) {
        // HOD sees department staff: faculty sharing any of HOD's assigned courses
        const myStaff = data.find(st => (st.email || "").toLowerCase().trim() === loggedInEmail.toLowerCase().trim() || (user?.user_id && Number(st.user_id) === Number(user.user_id)));
        const myCourseIds = getStaffCourseIds(myStaff);
        if (myCourseIds.length > 0) {
          const deptStaff = data.filter(st => {
            if ((st.email || "").toLowerCase().trim() === loggedInEmail.toLowerCase().trim()) return true;
            const stCourseIds = getStaffCourseIds(st);
            return stCourseIds.some(cid => myCourseIds.includes(cid));
          });
          setStaffList(deptStaff.length > 0 ? deptStaff : data);
        } else {
          setStaffList(data);
        }
      } else {
        setStaffList(data);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔒 Student ko staff page access nahi hai, redirect to dashboard
    if (roleId === 4) {
      navigate("/dashboard");
      return;
    }
    fetchStaff();
    fetchCourses();
  }, [roleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileno") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setStaff(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    if (name === "course_id") {
      setStaff(prev => ({ ...prev, course_id: value ? Number(value) : "" }));
      return;
    }
    setStaff(prev => ({
      ...prev,
      [name]: (name === "salary") ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleAddCourseToStaff = () => {
    if (!addCourseToAdd) return;
    const cid = Number(addCourseToAdd);
    if (!addStaffCourseIds.includes(cid)) {
      setAddStaffCourseIds(prev => [...prev, cid]);
    }
    setAddCourseToAdd("");
  };

  const handleRemoveCourseFromStaff = (cid) => {
    setAddStaffCourseIds(prev => prev.filter(id => id !== cid));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (staff.mobileno && staff.mobileno.length !== 10) {
      alert("Mobile number must be exactly 10 digits!");
      return;
    }

    const emailTrimmed = (staff.email || "").trim().toLowerCase();
    const existingStaff = staffList.find(s => (s.email || "").trim().toLowerCase() === emailTrimmed);
    if (existingStaff) {
      alert(`⚠️ Duplicate Staff Member Detected!\n\nStaff member with email "${staff.email}" is already registered as:\n"${existingStaff.staffname || existingStaff.staffName}" (#ID: ${existingStaff.staffid || existingStaff.staffId}).\n\nReal colleges maintain a single profile per staff member. Please use the ✏️ Edit button on their row in the table below to assign courses or update details.`);
      return;
    }

    const payload = {
      ...staff,
      course_id: addStaffCourseIds.length > 0 ? addStaffCourseIds[0] : null,
      course_ids: addStaffCourseIds.length > 0 ? addStaffCourseIds.join(",") : null
    };

    try {
      try {
        await axios.post("http://localhost:8080/staff/add", payload, { headers: getAuthHeaders() });
      } catch (e) {
        await axios.post("http://localhost:8080/api/staff", payload, { headers: getAuthHeaders() });
      }
      alert("Staff Member Registered Successfully!");
      setStaff({
        staffname: "", designation: "", mobileno: "", email: "",
        gender: "", dob: "", joiningdate: "", salary: "", address: "", course_id: ""
      });
      setAddStaffCourseIds([]);
      setAddCourseToAdd("");
      fetchStaff();
    } catch (error) {
      console.error("Error saving staff record:", error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Error saving staff record.";
      alert(msg);
    }
  };

  const handleOpenEdit = (st) => {
    setEditingStaff(st);
    const currentCourseIds = getStaffCourseIds(st);
    setEditFormData({
      staffname: st.staffname || st.staffName || "",
      designation: st.designation || "",
      mobileno: st.mobileno || st.mobileNo || "",
      email: st.email || "",
      gender: st.gender || "",
      dob: st.dob ? String(st.dob).slice(0, 10) : "",
      joiningdate: st.joiningdate ? String(st.joiningdate).slice(0, 10) : "",
      salary: st.salary || "",
      address: st.address || "",
      course_id: currentCourseIds.length > 0 ? currentCourseIds[0] : "",
      courseIds: currentCourseIds
    });
    setEditCourseToAdd("");
  };

  const handleAddCourseToEdit = () => {
    if (!editCourseToAdd) return;
    const cid = Number(editCourseToAdd);
    if (!editFormData.courseIds.includes(cid)) {
      setEditFormData(prev => ({
        ...prev,
        courseIds: [...prev.courseIds, cid]
      }));
    }
    setEditCourseToAdd("");
  };

  const handleRemoveCourseFromEdit = (cid) => {
    setEditFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.filter(id => id !== cid)
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileno") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setEditFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    if (name === "course_id") {
      setEditFormData(prev => ({ ...prev, course_id: value ? Number(value) : "" }));
      return;
    }
    setEditFormData(prev => ({
      ...prev,
      [name]: (name === "salary") ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;
    const id = editingStaff.staffid || editingStaff.staffId;
    if (!id) return;

    if (editFormData.mobileno && editFormData.mobileno.length !== 10) {
      alert("Mobile number must be exactly 10 digits!");
      return;
    }

    const cIds = editFormData.courseIds || [];
    const payload = {
      ...editFormData,
      course_id: cIds.length > 0 ? cIds[0] : null,
      course_ids: cIds.length > 0 ? cIds.join(",") : null
    };

    setActionLoading(true);
    try {
      try {
        await axios.put(`http://localhost:8080/staff/${id}`, payload, { headers: getAuthHeaders() });
      } catch (e) {
        await axios.put(`http://localhost:8080/staff/update/${id}`, payload, { headers: getAuthHeaders() });
      }
      alert("Staff details & assigned course(s) updated successfully!");
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error("Error updating staff:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Error updating staff record.";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async (st) => {
    const id = st.staffid || st.staffId;
    if (!id) return;
    if (!window.confirm(`Are you sure you want to delete staff member "${st.staffname || st.staffName}" (#ID: ${id})?\n\nThis is useful for cleaning up duplicate or obsolete staff records.`)) {
      return;
    }
    try {
      try {
        await axios.delete(`http://localhost:8080/staff/${id}`, { headers: getAuthHeaders() });
      } catch (e) {
        await axios.delete(`http://localhost:8080/staff/delete/${id}`, { headers: getAuthHeaders() });
      }
      alert("Staff record deleted successfully!");
      fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff record.");
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
      <div style={{ width: "100%", maxWidth: "1350px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Top Header Card */}
        <div style={{
          background: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
          borderRadius: "24px", padding: "30px 36px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 12px 30px rgba(245, 158, 11, 0.3)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaUserTie size={26} />
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>Staff Management</h1>
            </div>
            <p style={{ margin: "6px 0 0 48px", opacity: 0.9, fontSize: "14px" }}>
              {isPrincipal ? "Principal Access: All College Faculty Directory" : isProfessor ? "My Faculty Profile & Salary Record" : "Manage Staff & Faculty Details"}
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

        {/* ADD STAFF FORM (Visible for HOD & Principal only) */}
        {canManageStaff && (
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "36px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
          }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
              Add New Staff Member
            </h3>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STAFF NAME *</label>
                  <input name="staffname" value={staff.staffname} onChange={handleChange} placeholder="Enter Full Name" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>DESIGNATION *</label>
                  <input name="designation" value={staff.designation} onChange={handleChange} placeholder="e.g. Assistant Professor" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>
                    ASSIGNED DEPARTMENT / COURSE(S)
                  </label>
                  {addStaffCourseIds.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
                      {addStaffCourseIds.map(cid => {
                        const found = courses.find(c => Number(c.course_id || c.courseId || c.id) === Number(cid));
                        return (
                          <span key={cid} style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                            background: "rgba(245, 158, 11, 0.15)", color: "#d97706",
                            border: "1px solid rgba(245, 158, 11, 0.35)"
                          }}>
                            <FaGraduationCap size={12} />
                            <span>{found ? `${found.course_name || found.courseName} (${found.semester || "Sem 1"})` : `Course #${cid}`}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCourseFromStaff(cid)}
                              style={{
                                background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                                display: "flex", alignItems: "center", padding: "0 2px", fontSize: "12px", fontWeight: "bold"
                              }}
                              title="Remove course"
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={addCourseToAdd}
                      onChange={(e) => setAddCourseToAdd(e.target.value)}
                      style={{
                        flex: 1, padding: "12px 16px", borderRadius: "12px",
                        border: `1.5px solid ${themeStyles.inputBorder}`,
                        background: themeStyles.inputBg, color: themeStyles.textPrimary,
                        outline: "none", fontSize: "13px"
                      }}
                    >
                      <option value="">Select Course to Assign...</option>
                      {assignableCourses
                        .filter(c => !addStaffCourseIds.includes(Number(c.course_id || c.courseId || c.id)))
                        .map((c, i) => {
                          const cId = c.course_id || c.courseId || c.id;
                          const cName = c.course_name || c.courseName || `Course #${cId}`;
                          const cSem = c.semester || "";
                          return (
                            <option key={i} value={cId}>
                              {cName} {cSem ? `(${cSem})` : ""}
                            </option>
                          );
                        })}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCourseToStaff}
                      disabled={!addCourseToAdd}
                      style={{
                        padding: "0 16px", borderRadius: "12px", border: "none",
                        background: addCourseToAdd ? "#d97706" : "#94a3b8",
                        color: "white", fontWeight: "700", fontSize: "13px",
                        cursor: addCourseToAdd ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap"
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>MOBILE NUMBER (10 DIGITS) *</label>
                  <input type="tel" name="mobileno" value={staff.mobileno} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>EMAIL ADDRESS *</label>
                  <input type="email" name="email" value={staff.email} onChange={handleChange} placeholder="staff@college.edu" required style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>GENDER</label>
                  <select name="gender" value={staff.gender} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>DATE OF BIRTH</label>
                  <input type="date" name="dob" value={staff.dob} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>JOINING DATE</label>
                  <input type="date" name="joiningdate" value={staff.joiningdate} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>SALARY (INR)</label>
                  <input type="number" name="salary" value={staff.salary} onChange={handleChange} placeholder="e.g. 50000" style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>FULL ADDRESS</label>
                  <input name="address" value={staff.address} onChange={handleChange} placeholder="Enter Full Address" style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "28px" }}>
                <button type="submit" style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "14px 36px",
                  background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", color: "white",
                  border: "none", borderRadius: "14px", cursor: "pointer", fontWeight: "700",
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)"
                }}>
                  <FaSave /> Save Staff Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAFF DIRECTORY TABLE */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "24px", padding: "32px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FaUsers color="#f59e0b" size={20} />
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
              {isPrincipal ? `Complete Staff Directory (${staffList.length} Total)` : isProfessor ? "My Staff Profile" : `Staff Directory (${staffList.length} Total)`}
            </h3>
          </div>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", color: themeStyles.textPrimary, minWidth: "1100px" }}>
              <thead>
                <tr style={{ background: themeStyles.tableHeaderBg }}>
                  <th style={{ padding: "16px" }}>ID</th>
                  <th style={{ padding: "16px" }}>Staff Name</th>
                  <th style={{ padding: "16px" }}>Designation</th>
                  <th style={{ padding: "16px" }}>Assigned Department / Course</th>
                  <th style={{ padding: "16px" }}>Mobile (10 Digits)</th>
                  <th style={{ padding: "16px" }}>Email</th>
                  <th style={{ padding: "16px" }}>Gender</th>
                  <th style={{ padding: "16px" }}>DOB</th>
                  <th style={{ padding: "16px" }}>Joining Date</th>
                  <th style={{ padding: "16px" }}>Salary (₹)</th>
                  <th style={{ padding: "16px" }}>Address</th>
                  {canManageStaff && (
                    <th style={{ padding: "16px", textAlign: "center" }}>Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canManageStaff ? "12" : "11"} style={{ textAlign: "center", padding: "28px" }}>Loading staff records...</td></tr>
                ) : staffList.length === 0 ? (
                  <tr><td colSpan={canManageStaff ? "12" : "11"} style={{ textAlign: "center", padding: "28px", color: themeStyles.textSecondary }}>No staff records found.</td></tr>
                ) : (
                  staffList.map((st, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${themeStyles.cardBorder}`, transition: "background 0.2s" }}>
                      <td style={{ padding: "16px", fontWeight: "700", color: "#f59e0b" }}>#{st.staffid || st.staffId || idx + 1}</td>
                      <td style={{ padding: "16px", fontWeight: "700" }}>{st.staffname || st.staffName}</td>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{st.designation}</td>
                      <td style={{ padding: "16px" }}>
                        {(() => {
                          const assignedIds = getStaffCourseIds(st);
                          if (assignedIds.length === 0) {
                            return <span style={{ color: themeStyles.textSecondary, fontStyle: "italic" }}>Not Assigned</span>;
                          }
                          return (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {assignedIds.map(cid => {
                                const found = courses.find(c => Number(c.course_id || c.courseId || c.id) === Number(cid));
                                return found ? (
                                  <span key={cid} style={{
                                    padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                                    background: "rgba(2, 132, 199, 0.12)", color: "#0284c7",
                                    border: "1px solid rgba(2, 132, 199, 0.25)", display: "inline-flex", alignItems: "center", gap: "5px"
                                  }}>
                                    <FaGraduationCap size={12} />
                                    <span>{found.course_name || found.courseName}</span>
                                    <span style={{ color: "#0369a1", fontSize: "10px", fontWeight: "800" }}>({found.semester || "Sem 1"})</span>
                                  </span>
                                ) : (
                                  <span key={cid} style={{
                                    padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                                    background: "rgba(99, 102, 241, 0.12)", color: "#6366f1"
                                  }}>
                                    Course #{cid}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: "16px", fontWeight: "600" }}>{st.mobileno || st.mobileNo || "-"}</td>
                      <td style={{ padding: "16px" }}>{st.email}</td>
                      <td style={{ padding: "16px" }}>{st.gender || "-"}</td>
                      <td style={{ padding: "16px" }}>{st.dob || "-"}</td>
                      <td style={{ padding: "16px" }}>{st.joiningdate || st.joiningDate || "-"}</td>
                      <td style={{ padding: "16px", fontWeight: "700", color: "#10b981" }}>
                        {st.salary ? `₹${Number(st.salary).toLocaleString()}` : "-"}
                      </td>
                      <td style={{ padding: "16px", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {st.address || "-"}
                      </td>
                      {canManageStaff && (
                        <td style={{ padding: "16px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(st)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6",
                              border: "1px solid rgba(59, 130, 246, 0.35)", borderRadius: "10px",
                              padding: "6px 14px", fontSize: "12px", fontWeight: "700",
                              cursor: "pointer", marginRight: "8px"
                            }}
                            title="Edit Staff & Reassign Course"
                          >
                            <FaEdit /> Edit
                          </button>
                          {isPrincipal && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(st)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                background: "rgba(239, 68, 68, 0.12)", color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "10px",
                                padding: "6px 14px", fontSize: "12px", fontWeight: "700",
                                cursor: "pointer"
                              }}
                              title="Delete Duplicate Staff Record"
                            >
                              <FaTrashAlt /> Delete
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ✏️ EDIT STAFF MODAL */}
      {editingStaff && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
        }}>
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "32px", maxWidth: "680px", width: "100%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${themeStyles.cardBorder}`, maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", padding: "10px", borderRadius: "12px" }}>
                  <FaEdit size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
                    Edit Staff Profile & Course Assignment
                  </h3>
                  <span style={{ fontSize: "12px", color: themeStyles.textSecondary }}>
                    Staff ID #{editingStaff.staffid || editingStaff.staffId} • Real-Life Single Profile Management
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                style={{ background: "none", border: "none", color: themeStyles.textSecondary, cursor: "pointer", fontSize: "18px" }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>STAFF NAME *</label>
                  <input
                    name="staffname"
                    required
                    value={editFormData.staffname}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>DESIGNATION *</label>
                  <input
                    name="designation"
                    required
                    value={editFormData.designation}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>
              </div>

              {/* 🎓 Highlighted ASSIGNED COURSES & SEMESTERS selector */}
              <div style={{
                display: "flex", flexDirection: "column", gap: "10px",
                background: "rgba(2, 132, 199, 0.08)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(2, 132, 199, 0.25)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "13px", fontWeight: "800", color: "#0284c7", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaGraduationCap size={16} /> ASSIGNED DEPARTMENT / COURSE(S) & SEMESTER(S)
                  </label>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1", background: "rgba(2, 132, 199, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                    {(editFormData.courseIds || []).length} Assigned
                  </span>
                </div>

                {/* Badges of all currently assigned courses */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "36px", alignItems: "center" }}>
                  {(!editFormData.courseIds || editFormData.courseIds.length === 0) ? (
                    <span style={{ fontSize: "12px", color: themeStyles.textSecondary, fontStyle: "italic" }}>
                      No course assigned yet. Choose from below and click "+ Add Course".
                    </span>
                  ) : (
                    editFormData.courseIds.map(cid => {
                      const found = courses.find(c => Number(c.course_id || c.courseId || c.id) === Number(cid));
                      return (
                        <span key={cid} style={{
                          display: "inline-flex", alignItems: "center", gap: "8px",
                          padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
                          background: "rgba(2, 132, 199, 0.15)", color: "#0284c7",
                          border: "1px solid rgba(2, 132, 199, 0.35)", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.15)"
                        }}>
                          <FaGraduationCap size={13} />
                          <span>{found ? `${found.course_name || found.courseName} (${found.semester || "Sem 1"})` : `Course #${cid}`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourseFromEdit(cid)}
                            style={{
                              background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                              display: "flex", alignItems: "center", padding: "0 2px", fontSize: "14px", fontWeight: "bold"
                            }}
                            title="Remove this assigned course"
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Dropdown & Add Button to attach additional courses */}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <select
                    value={editCourseToAdd}
                    onChange={(e) => setEditCourseToAdd(e.target.value)}
                    style={{
                      flex: 1, padding: "11px 14px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`,
                      background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none", fontSize: "13px", fontWeight: "600"
                    }}
                  >
                    <option value="">-- Select Another Course & Semester to Assign --</option>
                    {assignableCourses
                      .filter(c => !(editFormData.courseIds || []).includes(Number(c.course_id || c.courseId || c.id)))
                      .map((c, i) => {
                        const cId = c.course_id || c.courseId || c.id;
                        const cName = c.course_name || c.courseName || `Course #${cId}`;
                        const cSem = c.semester || "";
                        return (
                          <option key={i} value={cId}>
                            {cName} {cSem ? `(${cSem})` : ""}
                          </option>
                        );
                      })}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCourseToEdit}
                    disabled={!editCourseToAdd}
                    style={{
                      padding: "11px 20px", borderRadius: "12px", border: "none",
                      background: editCourseToAdd ? "#0284c7" : "#94a3b8",
                      color: "white", fontWeight: "700", fontSize: "13px",
                      cursor: editCourseToAdd ? "pointer" : "not-allowed",
                      display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap"
                    }}
                  >
                    <FaPlus size={12} /> Add Course
                  </button>
                </div>

                <span style={{ fontSize: "11px", color: themeStyles.textSecondary }}>
                  💡 Real-life multi-course assignment: Assign multiple degrees/semesters to this HOD or Professor without creating duplicate accounts!
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={editFormData.email}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>MOBILE (10 DIGITS) *</label>
                  <input
                    type="tel"
                    name="mobileno"
                    maxLength={10}
                    required
                    value={editFormData.mobileno}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>GENDER</label>
                  <select
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>SALARY (INR)</label>
                  <input
                    type="number"
                    name="salary"
                    value={editFormData.salary}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>JOINING DATE</label>
                  <input
                    type="date"
                    name="joiningdate"
                    value={editFormData.joiningdate}
                    onChange={handleEditChange}
                    style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: themeStyles.labelColor }}>ADDRESS</label>
                <input
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  style={{ padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  style={{
                    padding: "12px 20px", borderRadius: "12px", border: `1px solid ${themeStyles.inputBorder}`,
                    background: "none", color: themeStyles.textSecondary, fontWeight: "700", cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: "12px 28px", borderRadius: "12px", border: "none",
                    background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                    color: "white", fontWeight: "800", cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(2, 132, 199, 0.4)",
                    opacity: actionLoading ? 0.7 : 1
                  }}
                >
                  {actionLoading ? "Updating..." : "Update Staff Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;