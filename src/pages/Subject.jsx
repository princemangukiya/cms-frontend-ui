import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Subject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subjectName: "", subjectCode: "", subjectCredit: "", subjectType: "", courseId: "", examId: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        subjectCredit: parseInt(formData.subjectCredit),
        subjectType: formData.subjectType,
        courseId: parseInt(formData.courseId),
        examId: parseInt(formData.examId)
    };

    try {
      await axios.post("http://localhost:8080/api/subjects/save", payload);
      alert("Subject Added Successfully!");
      setFormData({ subjectName: "", subjectCode: "", subjectCredit: "", subjectType: "", courseId: "", examId: "" });
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Subject Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add New Subject Details</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input name="subjectName" placeholder="Subject Name" onChange={handleChange} value={formData.subjectName} required style={styles.input} />
            <input name="subjectCode" placeholder="Subject Code" onChange={handleChange} value={formData.subjectCode} required style={styles.input} />
            <input name="subjectCredit" type="number" placeholder="Subject Credit" onChange={handleChange} value={formData.subjectCredit} required style={styles.input} />
            <input name="subjectType" placeholder="Subject Type" onChange={handleChange} value={formData.subjectType} required style={styles.input} />
            <input name="courseId" type="number" placeholder="Course ID" onChange={handleChange} value={formData.courseId} required style={styles.input} />
            <input name="examId" type="number" placeholder="Exam ID" onChange={handleChange} value={formData.examId} required style={styles.input} />
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Subject</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", padding: "40px", display: "flex", justifyContent: "center" },
  card: { width: "100%", maxWidth: "800px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  header: { background: "#4a90e2", padding: "30px", color: "#fff", textAlign: "center" },
  form: { padding: "30px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Subject;