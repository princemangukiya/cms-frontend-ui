import React, { useState } from 'react';
import axios from 'axios';

const Exam = () => {
  const [exam, setExam] = useState({
    course_id: '', exam_type: '', exam_start_date: '', exam_end_date: '', exam_time: '', subject_id: ''
  });

  const handleChange = (e) => setExam({ ...exam, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/exams', exam);
      alert("Exam details saved successfully!");
    } catch (err) {
      alert("Error: " + (err.response?.data || err.message));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>Add Exam Details</h2>
      <form onSubmit={handleSubmit}>

        <label>Course ID</label>
        <input name="course_id" placeholder="Enter Course ID" onChange={handleChange} style={inputStyle} required />

        <label>Exam Type</label>
        <input name="exam_type" placeholder="e.g. Mid-Term / Final" onChange={handleChange} style={inputStyle} required />

        {/* Yahan humne clear labels diye hain */}
        <label>Start Date</label>
        <input type="date" name="exam_start_date" onChange={handleChange} style={inputStyle} required />

        <label>End Date</label>
        <input type="date" name="exam_end_date" onChange={handleChange} style={inputStyle} required />

        <label>Exam Time</label>
        <input type="time" name="exam_time" onChange={handleChange} style={inputStyle} required />

        <label>Subject ID</label>
        <input name="subject_id" placeholder="Enter Subject ID" onChange={handleChange} style={inputStyle} required />

        <button type="submit" style={btnStyle}>Save Exam</button>
      </form>
    </div>
  );
};

// Styles
const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer' };

export default Exam;