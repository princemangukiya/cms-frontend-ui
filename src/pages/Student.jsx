import { useState } from "react";
import axios from "axios";

function Student() {
  const [student, setStudent] = useState({
    student_name: "",
    mobile_no: "",
    gender: "",
    address: "",
    dob: "",
    email: "",
    admission_date: "",
    status: "",
    roll_no: "",
    user_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Backend ko data bhej rahe hain
      const res = await axios.post("http://localhost:8080/student", student);
      console.log("Response:", res.data);
      alert("Student Saved Successfully");

      // Form clear kar rahe hain
      setStudent({
        student_name: "",
        mobile_no: "",
        gender: "",
        address: "",
        dob: "",
        email: "",
        admission_date: "",
        status: "",
        roll_no: "",
        user_id: "",
      });
    } catch (error) {
      console.error("ERROR:", error);
      alert("Error saving student. Check console for details.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Student Management</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input name="student_name" value={student.student_name} onChange={handleChange} placeholder="Student Name" style={inputStyle} required />
          <input name="mobile_no" value={student.mobile_no} onChange={handleChange} placeholder="Mobile No" style={inputStyle} />
          <input name="gender" value={student.gender} onChange={handleChange} placeholder="Gender" style={inputStyle} />
          <input name="address" value={student.address} onChange={handleChange} placeholder="Address" style={inputStyle} />

          <label>Date of Birth</label>
          <input type="date" name="dob" value={student.dob} onChange={handleChange} style={inputStyle} />

          <input name="email" value={student.email} onChange={handleChange} placeholder="Email" style={inputStyle} />

          <label>Admission Date</label>
          <input type="date" name="admission_date" value={student.admission_date} onChange={handleChange} style={inputStyle} />

          <input name="status" value={student.status} onChange={handleChange} placeholder="Status" style={inputStyle} />
          <input name="roll_no" value={student.roll_no} onChange={handleChange} placeholder="Roll No" style={inputStyle} />
          <input type="number" name="user_id" value={student.user_id} onChange={handleChange} placeholder="User ID" style={inputStyle} />

          <button type="submit" style={buttonStyle}>Save Student</button>
        </form>
      </div>
    </div>
  );
}

/* Styles */
const pageStyle = { display: "flex", justifyContent: "center", padding: "20px", background: "#f4f4f4", minHeight: "100vh" };
const cardStyle = { background: "#fff", padding: "20px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const formStyle = { display: "flex", flexDirection: "column", gap: "10px" };
const inputStyle = { padding: "10px", border: "1px solid #ccc", borderRadius: "5px" };
const buttonStyle = { padding: "10px", background: "black", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" };

export default Student;