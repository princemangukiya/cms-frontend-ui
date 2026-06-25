import React, { useState } from 'react';
import axios from 'axios';

const ClassMgmt = () => {
  const [classData, setClassData] = useState({
    class_name: '', // Database column name ke hisaab se
    course_id: '',
    building_no: '',
    floor_no: '',
    room_no: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Backend ke endpoint ke sath check karein
      await axios.post('http://localhost:8080/api/class-management', classData);
      alert("Class saved successfully!");
      setClassData({ class_name: '', course_id: '', building_no: '', floor_no: '', room_no: '' });
    } catch (error) {
      alert("Error: " + (error.response?.data || error.message));
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Class Management</h2>
        <form onSubmit={handleSave}>
          <input type="text" name="class_name" placeholder="Class Name" value={classData.class_name} onChange={handleInputChange} style={inputStyle} required />
          <input type="number" name="course_id" placeholder="Course ID" value={classData.course_id} onChange={handleInputChange} style={inputStyle} required />
          <input type="text" name="building_no" placeholder="Building No" value={classData.building_no} onChange={handleInputChange} style={inputStyle} required />
          <input type="text" name="floor_no" placeholder="Floor No" value={classData.floor_no} onChange={handleInputChange} style={inputStyle} required />
          <input type="text" name="room_no" placeholder="Room No" value={classData.room_no} onChange={handleInputChange} style={inputStyle} required />
          <button type="submit" style={btnStyle}>Save Class</button>
        </form>
      </div>
    </div>
  );
};

// Styles
const containerStyle = { display: 'flex', justifyContent: 'center', marginTop: '50px' };
const formCardStyle = { border: '1px solid #ddd', padding: '30px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' };
const inputStyle = { display: 'block', width: '100%', marginBottom: '15px', padding: '10px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#000', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' };

export default ClassMgmt;