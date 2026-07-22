import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Student() {
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    student_name: "", mobile_no: "", gender: "", address: "",
    dob: "", email: "", admission_date: "", status: "",
    roll_no: "", user_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/student", student);
      alert("Student Saved Successfully");
      setStudent({
        student_name: "", mobile_no: "", gender: "", address: "",
        dob: "", email: "", admission_date: "", status: "",
        roll_no: "", user_id: "",
      });
    } catch (error) {
      alert("Error saving student.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Student Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage Student Details</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input name="student_name" value={student.student_name} onChange={handleChange} placeholder="Student Name" style={styles.input} required />
            <input name="mobile_no" value={student.mobile_no} onChange={handleChange} placeholder="Mobile No" style={styles.input} />
            <input name="gender" value={student.gender} onChange={handleChange} placeholder="Gender" style={styles.input} />
            <input name="address" value={student.address} onChange={handleChange} placeholder="Address" style={styles.input} />

            {/* Date of Birth Field */}
            <div style={styles.fieldWrapper}>
                <label style={styles.label}>Date of Birth</label>
                <input type="date" name="dob" value={student.dob} onChange={handleChange} style={styles.input} />
            </div>

            <input name="email" value={student.email} onChange={handleChange} placeholder="Email" style={styles.input} />

            {/* Admission Date Field */}
            <div style={styles.fieldWrapper}>
                <label style={styles.label}>Admission Date</label>
                <input type="date" name="admission_date" value={student.admission_date} onChange={handleChange} style={styles.input} />
            </div>

            <input name="status" value={student.status} onChange={handleChange} placeholder="Status" style={styles.input} />
            <input name="roll_no" value={student.roll_no} onChange={handleChange} placeholder="Roll No" style={styles.input} />
            <input type="number" name="user_id" value={student.user_id} onChange={handleChange} placeholder="User ID" style={styles.input} />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  // UPDATED: Background image with overlay
  page: {
    minHeight: "100vh",
    // 1. Background Image path (must be in /public)
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('/bg-student.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box"
  },
  card: { width: "100%", maxWidth: "800px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  header: { background: "#4a90e2", padding: "30px", color: "#fff", textAlign: "center" },
  form: { padding: "30px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  fieldWrapper: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#666" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Student;