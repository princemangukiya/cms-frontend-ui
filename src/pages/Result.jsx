import { useState } from "react";
import axios from "axios"; // 1. Axios import karein

function Result() {
  const [result, setResult] = useState({
    // Note: Agar backend mein @GeneratedValue use kar rahe hain,
    // toh result_id ko yahan se hata sakte hain ya null bhej sakte hain.
    student_id: "",
    subject_id: "",
    total_marks: "",
    grade: "",
    status: "",
  });

  const handleChange = (e) => {
    setResult({
      ...result,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 2. Axios se backend ko data bhejein
      const response = await axios.post("http://localhost:8080/api/results", result);
      console.log("Saved Data:", response.data);
      alert("Result Saved Successfully!");

      // 3. Form reset karein
      setResult({
        student_id: "",
        subject_id: "",
        total_marks: "",
        grade: "",
        status: "",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save result. Check console!");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "20px" }}>Result Management</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

          <input type="text" name="student_id" placeholder="Student ID" value={result.student_id} onChange={handleChange} style={inputStyle} required />
          <input type="text" name="subject_id" placeholder="Subject ID" value={result.subject_id} onChange={handleChange} style={inputStyle} required />
          <input type="number" name="total_marks" placeholder="Total Marks" value={result.total_marks} onChange={handleChange} style={inputStyle} required />
          <input type="text" name="grade" placeholder="Grade (A, B, C...)" value={result.grade} onChange={handleChange} style={inputStyle} required />

          <select name="status" value={result.status} onChange={handleChange} style={inputStyle} required>
            <option value="">Select Status</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>

          <button type="submit" style={buttonStyle}>Save Result</button>
        </form>
      </div>
    </div>
  );
}

/* STYLES */
const pageStyle = { padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f4f4f4" };
const cardStyle = { background: "white", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" };
const buttonStyle = { padding: "10px", background: "#222", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };

export default Result;