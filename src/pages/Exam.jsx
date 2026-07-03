import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Exam = () => {
  const navigate = useNavigate();
  const [exam, setExam] = useState({
    course_id: '', exam_type: '', exam_start_date: '', exam_end_date: '', exam_time: '', subject_id: ''
  });

  const handleChange = (e) => setExam({ ...exam, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/exams', exam);
      alert("Exam details saved successfully!");
      setExam({ course_id: '', exam_type: '', exam_start_date: '', exam_end_date: '', exam_time: '', subject_id: '' });
    } catch (err) {
      alert("Error: " + (err.response?.data || err.message));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Exam Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add New Exam Details</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Course ID</label>
              <input name="course_id" placeholder="Course ID" value={exam.course_id} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Subject ID</label>
              <input name="subject_id" placeholder="Subject ID" value={exam.subject_id} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Exam Type</label>
              <input name="exam_type" placeholder="e.g. Mid-Term / Final" value={exam.exam_type} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Start Date</label>
              <input type="date" name="exam_start_date" value={exam.exam_start_date} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>End Date</label>
              <input type="date" name="exam_end_date" value={exam.exam_end_date} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Exam Time</label>
              <input type="time" name="exam_time" value={exam.exam_time} onChange={handleChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Exam</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", padding: "40px", display: "flex", justifyContent: "center" },
  card: { width: "100%", maxWidth: "700px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
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

export default Exam;