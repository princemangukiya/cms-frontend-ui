import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BookIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookId: '', userId: '', issueDate: '', fine: '', reason: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      bookId: formData.bookId ? parseInt(formData.bookId) : null,
      userId: formData.userId ? parseInt(formData.userId) : null,
      issueDate: formData.issueDate,
      fine: formData.fine ? parseFloat(formData.fine) : 0.0,
      reason: formData.reason || ""
    };

    try {
      const response = await axios.post('http://localhost:8080/api/book-issues', payload);
      alert("Success: " + response.data);
      setFormData({ bookId: '', userId: '', issueDate: '', fine: '', reason: '' });
    } catch (error) {
      alert("Error: " + (error.response?.data || "Failed to save data."));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Book Issue Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage Issued Books</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input name="bookId" type="number" placeholder="Book ID" value={formData.bookId} onChange={handleInputChange} style={styles.input} required />
            <input name="userId" type="number" placeholder="User ID" value={formData.userId} onChange={handleInputChange} style={styles.input} required />

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Issue Date</label>
              <input name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} style={styles.input} required />
            </div>

            <input name="fine" type="number" placeholder="Fine Amount" value={formData.fine} onChange={handleInputChange} style={styles.input} step="0.01" />

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Reason for Issue</label>
              <textarea name="reason" placeholder="Enter Book Reason..." value={formData.reason} onChange={handleInputChange} style={{...styles.input, height: "80px"}} />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Book Issue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#f0f2f5", padding: "40px", display: "flex", justifyContent: "center" },
  card: { width: "100%", maxWidth: "800px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
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

export default BookIssue;