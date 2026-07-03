import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CompanyPlacement() {
  const navigate = useNavigate();
  const [company, setCompany] = useState({
    companyName: "", location: "", jobRole: "", packageLpa: "", website: ""
  });

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/companyplacements", company);
      alert("Company Details Saved Successfully!");
      setCompany({ companyName: "", location: "", jobRole: "", packageLpa: "", website: "" });
    } catch (error) {
      alert("Failed to Save Company Details.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Company Placement</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Add Placement Company Details</p>
        </div>

        <form onSubmit={saveCompany} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Company Name</label>
              <input type="text" name="companyName" placeholder="Enter Company Name" value={company.companyName} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Location</label>
              <input type="text" name="location" placeholder="Enter Location" value={company.location} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Job Role</label>
              <input type="text" name="jobRole" placeholder="Enter Job Role" value={company.jobRole} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Package (LPA)</label>
              <input type="number" step="0.01" name="packageLpa" placeholder="Enter Package" value={company.packageLpa} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Company Website</label>
              <input type="url" name="website" placeholder="https://example.com" value={company.website} onChange={handleChange} style={styles.input} required />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Company</button>
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

export default CompanyPlacement;