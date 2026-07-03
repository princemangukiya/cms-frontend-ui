import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Holiday() {
  const navigate = useNavigate();
  const [holiday, setHoliday] = useState({
    holidayId: "", holidayDate: "", holidayName: "",
  });

  const handleChange = (e) => {
    setHoliday({ ...holiday, [e.target.name]: e.target.value });
  };

  const saveHoliday = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/holidays", holiday);
      alert("Holiday saved successfully!");
      setHoliday({ holidayId: "", holidayDate: "", holidayName: "" });
    } catch (error) {
      alert("Failed to save holiday.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Holiday Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add Official College Holidays</p>
        </div>

        <form onSubmit={saveHoliday} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Holiday Date</label>
              <input type="date" name="holidayDate" value={holiday.holidayDate} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Holiday Name</label>
              <input type="text" name="holidayName" placeholder="Enter Holiday Name" value={holiday.holidayName} onChange={handleChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Holiday</button>
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

export default Holiday;