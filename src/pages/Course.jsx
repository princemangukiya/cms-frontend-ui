import { useState } from "react";
import axios from "axios";

function Course() {
  const [course, setCourse] = useState({
    // course_id ko yahan se hata dein kyunki DB auto-increment kar raha hai
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
      // Backend ko data bhejen
      await axios.post("http://localhost:8080/api/courses", {
        ...course,
        // course_fee ko number mein convert karke bhejen
        course_fee: parseFloat(course.course_fee)
      });

      alert("Course Saved Successfully");
      // Form reset karein
      setCourse({ course_name: "", semester: "", course_fee: "" });
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
          {/* Course ID input hata diya kyunki DB auto-increment hai */}
          <input type="text" name="course_name" placeholder="Course Name" value={course.course_name} onChange={handleChange} style={inputStyle} required />
          <input type="text" name="semester" placeholder="Semester (e.g. Sem 1 / Sem 2)" value={course.semester} onChange={handleChange} style={inputStyle} required />
          <input type="number" name="course_fee" placeholder="Course Fee" value={course.course_fee} onChange={handleChange} style={inputStyle} required />
          <button type="submit" style={buttonStyle}>Save Course</button>
        </form>
      </div>
    </div>
  );
}

// Styles...
const pageStyle = { padding: "20px", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f4f4f4" };
const cardStyle = { background: "white", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" };
const inputStyle = { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" };
const buttonStyle = { padding: "10px", background: "#222", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };

export default Course;