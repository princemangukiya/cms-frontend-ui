import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();
  const [payment, setPayment] = useState({
    feeId: "", studentId: "", paidAmount: "", date: "", paymentMode: "", transactionId: "", status: ""
  });

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const savePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/payments", payment);
      alert("Payment Saved Successfully!");
      setPayment({ feeId: "", studentId: "", paidAmount: "", date: "", paymentMode: "", transactionId: "", status: "" });
    } catch (error) {
      alert("Failed to save payment.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Payment Management</h2>
          <p style={{ margin: "5px 0 0 0", opacity: 0.8 }}>Manage Student Fee Payments</p>
        </div>

        <form onSubmit={savePayment} style={styles.form}>
          <div style={styles.grid}>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Fee ID</label>
              <input type="number" name="feeId" placeholder="Enter Fee ID" value={payment.feeId} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Student ID</label>
              <input type="number" name="studentId" placeholder="Enter Student ID" value={payment.studentId} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Paid Amount</label>
              <input type="number" name="paidAmount" placeholder="Enter Amount" value={payment.paidAmount} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Payment Date</label>
              <input type="date" name="date" value={payment.date} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Payment Mode</label>
              <select name="paymentMode" value={payment.paymentMode} onChange={handleChange} style={styles.input} required>
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Transaction ID</label>
              <input type="text" name="transactionId" placeholder="Enter Txn ID" value={payment.transactionId} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Payment Status</label>
              <select name="status" value={payment.status} onChange={handleChange} style={styles.input} required>
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

export default Payment;