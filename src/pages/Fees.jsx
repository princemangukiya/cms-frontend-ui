import React from 'react';

const Fees = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Fees Management</h1>
      <p>Yahan apni fees ka status check karein.</p>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Fee Details</h3>
        <p><strong>Total Fees:</strong> ₹1,50,000</p>
        <p><strong>Paid:</strong> ₹1,00,000</p>
        <p><strong>Remaining:</strong> ₹50,000</p>
        <button style={{ padding: '10px 20px', marginTop: '10px' }}>Pay Now</button>
      </div>
    </div>
  );
};

export default Fees;