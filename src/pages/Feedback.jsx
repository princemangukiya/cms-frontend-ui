import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Feedback() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    feedbackFrom: "", feedbackTo: "", rating: "", feedbackMessage: "",
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/feedback", feedback);
      alert("Feedback Saved Successfully!");
      setFeedback({ feedbackFrom: "", feedbackTo: "", rating: "", feedbackMessage: "" });
    } catch (error) {
      alert("Unable to Save Feedback");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Feedback Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Submit Your Feedback</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Feedback From</label>
              <select name="feedbackFrom" value={feedback.feedbackFrom} onChange={handleChange} style={styles.input} required>
                <option value="">Select Role</option>
                <option value="1">HOD</option>
                <option value="2">Principal</option>
                <option value="3">Professor</option>
                <option value="4">Student</option>
              </select>
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Feedback To</label>
              <select name="feedbackTo" value={feedback.feedbackTo} onChange={handleChange} style={styles.input} required>
                <option value="">Select Role</option>
                <option value="1">HOD</option>
                <option value="2">Principal</option>
                <option value="3">Professor</option>
                <option value="4">Student</option>
              </select>
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Rating</label>
              <select name="rating" value={feedback.rating} onChange={handleChange} style={styles.input} required>
                <option value="">Select Rating</option>
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Feedback Message</label>
              <textarea name="feedbackMessage" value={feedback.feedbackMessage} onChange={handleChange} placeholder="Enter your feedback here..." style={{...styles.input, height: "100px", resize: "none"}} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Feedback</button>
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  fieldWrapper: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#666" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Feedback;