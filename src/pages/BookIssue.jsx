import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaBook, FaUser, FaCalendarAlt,
  FaMoneyBillWave, FaCommentDots, FaArrowLeft, FaSave
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import "./BookIssue.css"; // CSS file import

const BookIssue = () => {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [formData, setFormData] = useState({
    bookId: '', userId: '', issueDate: '', fine: '', reason: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      bookId: formData.bookId ? parseInt(formData.bookId) : null,
      userId: formData.userId ? parseInt(formData.userId) : null,
      issueDate: formData.issueDate,
      fine: formData.fine ? parseFloat(formData.fine) : 0.0,
      reason: formData.reason || ""
    };

    try {
      const response = await axios.post('http://localhost:8080/api/book-issues', payload);
      alert("Success: " + response.data);
      setFormData({ bookId: '', userId: '', issueDate: '', fine: '', reason: '' });
    } catch (error) {
      alert("Error: " + (error.response?.data || "Failed to save data."));
    }
  };

  return (
    <div className={`book-issue-page ${darkMode ? "dark-mode" : ""}`}>
      <div className="book-issue-card">
        {/* Modern Amber Gradient Header */}
        <div className="book-issue-header">
          <h2>Book Issue Management</h2>
          <p>Manage Issued Books</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="book-issue-form">
          <div className="book-issue-grid">

            {/* Book ID */}
            <div className="field-group">
              <label>Book ID <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaBook className="input-icon" />
                <input
                  type="number"
                  name="bookId"
                  placeholder="Enter Book ID"
                  value={formData.bookId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* User ID */}
            <div className="field-group">
              <label>User ID <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="number"
                  name="userId"
                  placeholder="Enter User ID"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Issue Date */}
            <div className="field-group">
              <label>Issue Date <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Fine Amount */}
            <div className="field-group">
              <label>Fine Amount</label>
              <div className="input-wrapper">
                <FaMoneyBillWave className="input-icon" />
                <input
                  type="number"
                  name="fine"
                  step="0.01"
                  placeholder="Enter Fine Amount (Optional)"
                  value={formData.fine}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Reason for Issue */}
            <div className="field-group full-width">
              <label>Reason for Issue</label>
              <div className="input-wrapper textarea-wrapper">
                <FaCommentDots className="input-icon textarea-icon" />
                <textarea
                  name="reason"
                  placeholder="Enter Book Reason..."
                  value={formData.reason}
                  onChange={handleInputChange}
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              <FaArrowLeft size={14} /> Back
            </button>

            <button type="submit" className="save-btn">
              <FaSave size={14} /> Save Book Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookIssue;