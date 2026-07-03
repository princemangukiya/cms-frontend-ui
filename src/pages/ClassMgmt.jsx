import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ClassMgmt = () => {
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
    class_name: '', course_id: '', building_no: '', floor_no: '', room_no: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/class-management', classData);
      alert("Class saved successfully!");
      setClassData({ class_name: '', course_id: '', building_no: '', floor_no: '', room_no: '' });
    } catch (error) {
      alert("Error: " + (error.response?.data || error.message));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Class Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add New Class Details</p>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Class Name</label>
              <input name="class_name" placeholder="Enter Class Name" value={classData.class_name} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Course ID</label>
              <input type="number" name="course_id" placeholder="Enter Course ID" value={classData.course_id} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Building No</label>
              <input name="building_no" placeholder="Enter Building No" value={classData.building_no} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Floor No</label>
              <input name="floor_no" placeholder="Enter Floor No" value={classData.floor_no} onChange={handleInputChange} style={styles.input} required />
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Room No</label>
              <input name="room_no" placeholder="Enter Room No" value={classData.room_no} onChange={handleInputChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Class</button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

export default ClassMgmt;