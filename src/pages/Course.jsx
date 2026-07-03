import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Course() {
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    course_name: "",
    semester: "",
    course_fee: "",
  });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/courses", {
        ...course,
        course_fee: parseFloat(course.course_fee)
      });

      alert("Course Saved Successfully");
      setCourse({ course_name: "", semester: "", course_fee: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving course! Check backend console.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Course Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add New Course Details</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input type="text" name="course_name" placeholder="Course Name" value={course.course_name} onChange={handleChange} style={styles.input} required />
            <input type="text" name="semester" placeholder="Semester (e.g. Sem 1)" value={course.semester} onChange={handleChange} style={styles.input} required />
            <input type="number" name="course_fee" placeholder="Course Fee" value={course.course_fee} onChange={handleChange} style={styles.input} required />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Course</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", padding: "40px", display: "flex", justifyContent: "center" },
  card: { width: "100%", maxWidth: "600px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  header: { background: "#4a90e2", padding: "30px", color: "#fff", textAlign: "center" },
  form: { padding: "30px" },
  grid: { display: "flex", flexDirection: "column", gap: "20px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Course;