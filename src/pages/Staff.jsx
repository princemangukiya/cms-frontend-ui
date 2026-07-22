import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Staff() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState({
    staffname: "", designation: "", mobileno: "", gender: "",
    address: "", dob: "", email: "", joiningdate: "",
    salary: "", user_id: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({
      ...prev,
      [name]: (name === "salary" || name === "user_id")
              ? (value === "" ? null : parseInt(value))
              : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/staff/add", staff);
      alert("Staff Saved Successfully!");
      setStaff({
        staffname: "", designation: "", mobileno: "", gender: "",
        address: "", dob: "", email: "", joiningdate: "",
        salary: "", user_id: ""
      });
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Error! Check terminal for Foreign Key or Null constraint issues.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}><h2>Staff Management</h2></div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <input name="staffname" placeholder="Staff Name" value={staff.staffname} onChange={handleChange} style={styles.input} required />
            <input name="designation" placeholder="Designation" value={staff.designation} onChange={handleChange} style={styles.input} />
            <input name="mobileno" placeholder="Mobile No" value={staff.mobileno} onChange={handleChange} style={styles.input} />
            <input name="gender" placeholder="Gender" value={staff.gender} onChange={handleChange} style={styles.input} />
            <input name="address" placeholder="Address" value={staff.address} onChange={handleChange} style={styles.input} />
            <input type="date" name="dob" value={staff.dob} onChange={handleChange} style={styles.input} />
            <input name="email" type="email" placeholder="Email" value={staff.email} onChange={handleChange} style={styles.input} />
            <input type="date" name="joiningdate" value={staff.joiningdate} onChange={handleChange} style={styles.input} />
            <input name="salary" type="number" placeholder="Salary" value={staff.salary} onChange={handleChange} style={styles.input} />
            <input name="user_id" type="number" placeholder="User ID" value={staff.user_id} onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.buttonGroup}>
            <button type="button" onClick={() => navigate('/dashboard')} style={styles.backButton}>Back</button>
            <button type="submit" style={styles.saveButton}>Save Staff</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('/bg-staff.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box"
  },
  card: { width: "100%", maxWidth: "800px", background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  header: { background: "#4a90e2", padding: "30px", color: "#fff", textAlign: "center" },
  form: { padding: "30px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", width: "100%", boxSizing: "border-box" },
  buttonGroup: { display: "flex", gap: "15px", marginTop: "30px", justifyContent: "center" },
  saveButton: { padding: "12px 40px", background: "#4a90e2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  backButton: { padding: "12px 40px", background: "#e74c3c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default Staff;