import React from 'react';

const Payment = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Payment Gateway</h1>
      <p>Yahan se aap apni fees ka online bhugtan kar sakte hain.</p>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Make a Payment</h3>
        <input type="number" placeholder="Enter Amount" style={{ display: 'block', marginBottom: '10px', padding: '8px' }} />
        <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Pay Now</button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Transaction History</h3>
        <p>Koi purana transaction nahi mila.</p>
      </div>
    </div>
  );
};

export default Payment;