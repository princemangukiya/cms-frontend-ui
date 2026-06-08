import { useState } from "react";
import axios from "axios"; // Axios zaroori hai

function Course() {
  const [course, setCourse] = useState({
    course_id: "",
    course_name: "",
    semester: "",
    course_fee: "",
  });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend URL (Make sure your Controller mapping is /api/courses)
      await axios.post("http://localhost:8080/api/courses", course);
      alert("Course Saved Successfully");
      setCourse({ course_id: "", course_name: "", semester: "", course_fee: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving course! Check backend console.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "20px" }}>Course Management</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <input type="text" name="course_id" placeholder="Course ID" value={course.course_id} onChange={handleChange} style={inputStyle} required />
          <input type="text" name="course_name" placeholder="Course Name" value={course.course_name} onChange={handleChange} style={inputStyle} required />
          <input type="text" name="semester" placeholder="Semester (e.g. Sem 1 / Sem 2)" value={course.semester} onChange={handleChange} style={inputStyle} required />
          <input type="number" name="course_fee" placeholder="Course Fee" value={course.course_fee} onChange={handleChange} style={inputStyle} required />
          <button type="submit" style={buttonStyle}>Save Course</button>
        </form>
      </div>
    </div>
  );
}

// ... Styles wahi rahengi jo aapne di thin ...
const pageStyle = { padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", background: "#f4f4f4" };
const cardStyle = { background: "white", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" };
const buttonStyle = { padding: "10px", background: "#222", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };

export default Course;