import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Result() {
  const navigate = useNavigate();
  const [result, setResult] = useState({
    studentId: "", subjectId: "", totalMarks: "", grade: "", status: "",
  });

  const handleChange = (e) => {
    setResult((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      totalMarks: parseInt(result.totalMarks),
      grade: result.grade,
      status: result.status,
      student: { student_id: parseInt(result.studentId) },
      subject: { subject_id: parseInt(result.subjectId) }
    };

    try {
      await axios.post("http://localhost:8080/api/results/save", payload, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Result Saved Successfully!");
      setResult({ studentId: "", subjectId: "", totalMarks: "", grade: "", status: "" });
    } catch (error) {
      alert("Failed to save. Check console for error details!");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Result Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage Student Results</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input type="number" name="studentId" placeholder="Student ID" value={result.studentId} onChange={handleChange} style={styles.input} required />
            <input type="number" name="subjectId" placeholder="Subject ID" value={result.subjectId} onChange={handleChange} style={styles.input} required />
            <input type="number" name="totalMarks" placeholder="Total Marks" value={result.totalMarks} onChange={handleChange} style={styles.input} required />
            <input type="text" name="grade" placeholder="Grade (A, B, C...)" value={result.grade} onChange={handleChange} style={styles.input} required />
            <select name="status" value={result.status} onChange={handleChange} style={styles.input} required>
              <option value="">Select Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Result</button>
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

export default Result;