import { useState } from "react";
import axios from "axios";

function Subject() {
  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    subjectCredit: "",
    subjectType: "",
    courseId: "",
    examId: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data ko proper number type mein convert karke bhejein
    const payload = {
        ...formData,
        subjectCredit: parseInt(formData.subjectCredit),
        courseId: parseInt(formData.courseId),
        examId: parseInt(formData.examId)
    };

    try {
      await axios.post("http://localhost:8080/api/subjects/save", payload);
      alert("Subject Added Successfully!");
      setFormData({ subjectName: "", subjectCode: "", subjectCredit: "", subjectType: "", courseId: "", examId: "" });
    } catch (error) {
      console.error("Full error:", error);
      alert("Error saving: " + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <h2>Add New Subject</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input name="subjectName" placeholder="Subject Name" onChange={handleChange} value={formData.subjectName} required style={inputStyle} />
        <input name="subjectCode" placeholder="Subject Code" onChange={handleChange} value={formData.subjectCode} required style={inputStyle} />
        <input name="subjectCredit" type="number" placeholder="Subject Credit" onChange={handleChange} value={formData.subjectCredit} required style={inputStyle} />
        <input name="subjectType" placeholder="Subject Type (Theory/Lab)" onChange={handleChange} value={formData.subjectType} required style={inputStyle} />
        <input name="courseId" type="number" placeholder="Course ID" onChange={handleChange} value={formData.courseId} required style={inputStyle} />
        <input name="examId" type="number" placeholder="Exam ID" onChange={handleChange} value={formData.examId} required style={inputStyle} />
        <button type="submit" style={buttonStyle}>Save Subject</button>
      </form>
    </div>
  );
}

const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" };
const buttonStyle = { padding: "12px", background: "#333", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" };

export default Subject;