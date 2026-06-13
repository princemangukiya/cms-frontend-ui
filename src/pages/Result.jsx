import { useState } from "react";
import axios from "axios";

function Result() {
  const [result, setResult] = useState({
    studentId: "",
    subjectId: "",
    totalMarks: "",
    grade: "",
    status: "",
  });

  const handleChange = (e) => {
    setResult((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend ke structure (Entity) ke hisab se Payload prepare karna
    const payload = {
      totalMarks: parseInt(result.totalMarks),
      grade: result.grade,
      status: result.status,
      student: { studentId: parseInt(result.studentId) }, // Object nested structure
      subject: { subjectId: parseInt(result.subjectId) }  // Object nested structure
    };

    console.log("Sending to Backend:", JSON.stringify(payload));

    try {
      await axios.post("http://localhost:8080/api/results/save", payload, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Result Saved Successfully!");
      setResult({ studentId: "", subjectId: "", totalMarks: "", grade: "", status: "" });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Failed to save. Check console for error details!");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "20px", fontSize: "24px", textAlign: "center" }}>Result Management</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="number" name="studentId" placeholder="Student ID" value={result.studentId} onChange={handleChange} style={inputStyle} required />
          <input type="number" name="subjectId" placeholder="Subject ID" value={result.subjectId} onChange={handleChange} style={inputStyle} required />
          <input type="number" name="totalMarks" placeholder="Total Marks" value={result.totalMarks} onChange={handleChange} style={inputStyle} required />
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

const pageStyle = { padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f4f4f4" };
const cardStyle = { background: "white", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" };
const buttonStyle = { padding: "10px", background: "#222", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "10px" };

export default Result;