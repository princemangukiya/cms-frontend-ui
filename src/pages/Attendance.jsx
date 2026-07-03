import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Attendance() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userid: "", attendancedate: "", intime: "", outtime: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      userid: parseInt(formData.userid),
      attendancedate: formData.attendancedate,
      intime: formData.intime,
      outtime: formData.outtime
    };

    try {
      await axios.post("http://localhost:8080/api/attendance/save", dataToSend);
      alert("Attendance Saved Successfully!");
      setFormData({ userid: "", attendancedate: "", intime: "", outtime: "" });
    } catch (error) {
      alert("Error: Data save nahi hua! Console check karein.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Attendance Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Track Daily Attendance</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input style={styles.input} type="number" placeholder="User ID" value={formData.userid} onChange={(e) => setFormData({...formData, userid: e.target.value})} required />

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Attendance Date</label>
              <input style={styles.input} type="date" value={formData.attendancedate} onChange={(e) => setFormData({...formData, attendancedate: e.target.value})} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>In Time</label>
              <input style={styles.input} type="time" value={formData.intime} onChange={(e) => setFormData({...formData, intime: e.target.value})} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Out Time</label>
              <input style={styles.input} type="time" value={formData.outtime} onChange={(e) => setFormData({...formData, outtime: e.target.value})} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Attendance</button>
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
  fieldWrapper: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#666" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Attendance;