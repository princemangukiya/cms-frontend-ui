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

    // Data ko backend ke format mein convert karna
    const payload = {
      bookId: formData.bookId ? parseInt(formData.bookId) : null,
      userId: formData.userId ? parseInt(formData.userId) : null,
      issueDate: formData.issueDate, // Date format yyyy-MM-dd input type="date" se mil jata hai
      fine: formData.fine ? parseFloat(formData.fine) : 0.0,
      reason: formData.reason
    };

    try {
      const response = await axios.post('http://localhost:8080/api/book-issues', payload);
      console.log("Success:", response.data);
      alert("Book Issued Successfully!");
      // Form reset
      setFormData({ bookId: '', userId: '', issueDate: '', fine: '', reason: '' });
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Failed to save data. Error: " + (error.response?.data?.message || "Server Error 500"));
    }
  };

  return (
    <div className="management-container">
      <div className="management-card">
        <h2 className="management-title">Book Issue Management</h2>
        <form onSubmit={handleSubmit} className="management-form">
          <input type="number" name="bookId" placeholder="Book ID" value={formData.bookId} onChange={handleInputChange} className="form-control" required />
          <input type="number" name="userId" placeholder="User ID" value={formData.userId} onChange={handleInputChange} className="form-control" required />
          <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="form-control" required />
          <input type="number" name="fine" placeholder="Fine Amount" value={formData.fine} onChange={handleInputChange} className="form-control" step="0.01" />
          <textarea name="reason" placeholder="Reason for Issue" value={formData.reason} onChange={handleInputChange} className="form-control text-area-fix" rows="3"></textarea>
          <button type="submit" className="submit-btn">Save Book Issue</button>
        </form>
      </div>
    </div>
  );
};

export default BookIssue;