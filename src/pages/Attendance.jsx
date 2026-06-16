import { useState } from "react";
import axios from "axios";

function Attendance() {
  const [formData, setFormData] = useState({
    userid: "", attendancedate: "", intime: "", outtime: ""
  });

  const cardStyle = { padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px", margin: "20px auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" };
  const inputStyle = { width: "100%", padding: "10px", margin: "10px 0", boxSizing: "border-box" };
  const buttonStyle = { width: "100%", padding: "10px", backgroundColor: "black", color: "white", border: "none", cursor: "pointer" };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data ko clean karke bhejen
    const dataToSend = {
      userid: parseInt(formData.userid),
      attendancedate: formData.attendancedate, // HTML Date default "yyyy-MM-dd" hi deta hai
      intime: formData.intime, // HTML Time "HH:mm" format mein hota hai
      outtime: formData.outtime
    };

    try {
      await axios.post("http://localhost:8080/api/attendance/save", dataToSend);
      alert("Attendance Saved Successfully!");
      setFormData({ userid: "", attendancedate: "", intime: "", outtime: "" });
    } catch (error) {
      console.error("Backend Error:", error.response?.data);
      alert("Error: Data save nahi hua! Console check karein.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={cardStyle}>
        <h2>Attendance Management</h2>
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} type="number" placeholder="User ID" value={formData.userid} onChange={(e) => setFormData({...formData, userid: e.target.value})} required />
          <input style={inputStyle} type="date" value={formData.attendancedate} onChange={(e) => setFormData({...formData, attendancedate: e.target.value})} required />
          <input style={inputStyle} type="time" value={formData.intime} onChange={(e) => setFormData({...formData, intime: e.target.value})} required />
          <input style={inputStyle} type="time" value={formData.outtime} onChange={(e) => setFormData({...formData, outtime: e.target.value})} required />
          <button type="submit" style={buttonStyle}>Save Attendance</button>
        </form>
      </div>
    </div>
  );
}

export default Attendance;