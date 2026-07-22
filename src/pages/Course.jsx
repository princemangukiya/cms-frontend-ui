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
            {/* Course Name Dropdown */}
            <select name="course_name" value={course.course_name} onChange={handleChange} style={styles.input} required>
              <option value="">Select Course Name</option>
              <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
              <option value="M.Tech">M.Tech (Master of Technology)</option>
              <option value="BCA">BCA (Bachelor of Computer Applications)</option>
              <option value="MCA">MCA (Master of Computer Applications)</option>
              <option value="BSc">BSc (Bachelor of Science)</option>
              <option value="MSc">MSc (Master of Science)</option>
              <option value="BBA">BBA (Bachelor of Business Administration)</option>
              <option value="MBA">MBA (Master of Business Administration)</option>
              <option value="B.Com">B.Com (Bachelor of Commerce)</option>
              <option value="M.Com">M.Com (Master of Commerce)</option>
              <option value="BA">BA (Bachelor of Arts)</option>
              <option value="MA">MA (Master of Arts)</option>
              <option value="B.Pharm">B.Pharm (Bachelor of Pharmacy)</option>
              <option value="D.Pharm">D.Pharm (Diploma in Pharmacy)</option>
              <option value="LLB">LLB (Bachelor of Laws)</option>
              <option value="Diploma in Engineering">Diploma in Engineering</option>
            </select>

            {/* Semester Dropdown */}
            <select name="semester" value={course.semester} onChange={handleChange} style={styles.input} required>
              <option value="">Select Semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
              <option value="Semester 9">Semester 9</option>
              <option value="Semester 10">Semester 10</option>

            </select>

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
  page: {
    minHeight: "100vh",
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.35)), url('/bg-course.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box"
  },
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