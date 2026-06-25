import React, { useState } from 'react';
import axios from 'axios';
import './BookIssue.css';

const BookIssue = () => {
  const [formData, setFormData] = useState({
    bookId: '',
    userId: '',
    issueDate: '',
    fine: '',
    reason: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Data Validation: Ensure IDs are numbers
    const payload = {
      bookId: formData.bookId ? parseInt(formData.bookId) : null,
      userId: formData.userId ? parseInt(formData.userId) : null,
      issueDate: formData.issueDate, // YYYY-MM-DD format (HTML date picker yahi deta hai)
      fine: formData.fine ? parseFloat(formData.fine) : 0.0,
      reason: formData.reason || ""
    };

    try {
      // 2. Request bhejna
      const response = await axios.post('http://localhost:8080/api/book-issues', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      alert("Success: " + response.data);
      setFormData({ bookId: '', userId: '', issueDate: '', fine: '', reason: '' });

    } catch (error) {
      // 3. Detailed Error Handling
      console.error("Full Error:", error);
      const errorMessage = error.response?.data || "Database mein data nahi mil raha. Check kijiye ki Book ID aur User ID database mein exist karte hain.";
      alert("Error: " + errorMessage);
    }
  };

  return (
    <div className="management-container">
      <div className="management-card">
        <h2 className="management-title">Book Issue Management</h2>
        <form onSubmit={handleSubmit} className="management-form">
          <input
            type="number" name="bookId" placeholder="Book ID"
            value={formData.bookId} onChange={handleInputChange}
            className="form-control" required
          />
          <input
            type="number" name="userId" placeholder="User ID"
            value={formData.userId} onChange={handleInputChange}
            className="form-control" required
          />
          <input
            type="date" name="issueDate"
            value={formData.issueDate} onChange={handleInputChange}
            className="form-control" required
          />
          <input
            type="number" name="fine" placeholder="Fine Amount"
            value={formData.fine} onChange={handleInputChange}
            className="form-control" step="0.01"
          />
          <textarea
            name="reason" placeholder="Reason for Issue"
            value={formData.reason} onChange={handleInputChange}
            className="form-control text-area-fix" rows="3"
          ></textarea>
          <button type="submit" className="submit-btn">Save Book Issue</button>
        </form>
      </div>
    </div>
  );
};

export default BookIssue;