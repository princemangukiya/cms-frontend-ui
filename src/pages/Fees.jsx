import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Fees() {
  const navigate = useNavigate();
  const [fees, setFees] = useState({
    courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let updatedFees = { ...fees, [name]: value };

    if (["courseId", "scholarship", "discountPercentage"].includes(name) && updatedFees.courseId !== "") {
        try {
            const response = await axios.get(`http://localhost:8080/api/courses/${updatedFees.courseId}`);
            const courseFee = response.data.course_fee;
            let scholarship = Number(updatedFees.scholarship) || 0;
            let discount = Number(updatedFees.discountPercentage) || 0;
            let total = courseFee - scholarship;
            total = total - ((total * discount) / 100);
            updatedFees.totalFees = total.toFixed(2);
        } catch (error) {
            console.log(error);
        }
    }
    setFees(updatedFees);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/fees", fees);
      alert("Fees Saved Successfully");
      setFees({ courseId: "", studentId: "", scholarship: "", discountPercentage: "", totalFees: "" });
    } catch (error) {
      alert("Failed To Save Fees");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Fees Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage Student Fee Structure</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Student ID</label>
              <input type="number" name="studentId" placeholder="Enter Student ID" value={fees.studentId} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Course ID</label>
              <input type="number" name="courseId" placeholder="Enter Course ID" value={fees.courseId} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Scholarship Amount</label>
              <input type="number" step="0.01" name="scholarship" placeholder="Scholarship Amount" value={fees.scholarship} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Discount (%)</label>
              <input type="number" step="0.01" name="discountPercentage" placeholder="Discount Percentage" value={fees.discountPercentage} onChange={handleChange} style={styles.input} />
            </div>
            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Total Fees</label>
              <input type="number" step="0.01" name="totalFees" placeholder="Total Fees" value={fees.totalFees} readOnly style={{...styles.input, background: "#f9f9f9"}} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Fees</button>
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

export default Fees;