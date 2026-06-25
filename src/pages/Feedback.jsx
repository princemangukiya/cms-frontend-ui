import React, { useState } from 'react';
import './Feedback.css';
import axios from 'axios';

function Feedback() {
  const [formData, setFormData] = useState({
    feedback_from: '', // ID store hogi (e.g., "1")
    feedback_to: '',   // Role name store hoga (e.g., "Professor")
    feedback_rating: '',
    feedback_message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Database mein bheja gaya data:", formData);

    try {
      // API call
      await axios.post('http://localhost:8080/api/feedback/save', formData);
      alert("Feedback saved successfully!");

      // Form reset
      setFormData({
        feedback_from: '',
        feedback_to: '',
        feedback_rating: '',
        feedback_message: ''
      });
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Failed to save feedback.");
    }
  };

  return (
    <div className="feedback-wrapper">
      <div className="feedback-card">
        <div className="card-header">
          <h2>Share Your Feedback</h2>
          <p>We value your opinion!</p>
        </div>
        <form className="feedback-form" onSubmit={handleSubmit}>

          <div className="row">
            {/* From Dropdown: Label mein sirf Name, Value mein ID */}
            <select name="feedback_from" value={formData.feedback_from} onChange={handleChange} required>
              <option value="">From (Select Role)</option>
              <option value="1">Student</option>
              <option value="2">Professor</option>
              <option value="3">HOD</option>
              <option value="4">Principle</option>
            </select>

            {/* To Dropdown: Value mein Role Name */}
            <select name="feedback_to" value={formData.feedback_to} onChange={handleChange} required>
              <option value="">To (Select Role)</option>
              <option value="Professor">Professor</option>
              <option value="HOD">HOD</option>
              <option value="Principle">Principle</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <input
            type="number"
            name="feedback_rating"
            placeholder="Rating (1-5)"
            min="1" max="5"
            value={formData.feedback_rating}
            onChange={handleChange}
            required
          />

          <textarea
            name="feedback_message"
            placeholder="How was your experience?"
            value={formData.feedback_message}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">Save Feedback</button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;