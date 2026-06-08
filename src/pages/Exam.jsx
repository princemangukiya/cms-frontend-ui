import React from 'react';

const Exam = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Exam Schedule</h1>
      <p>Yahan aane wali examinations ki details show hongi.</p>

      <div style={{ marginTop: '20px' }}>
        <table border="1" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data Structures</td>
              <td>10 June 2026</td>
              <td>10:00 AM</td>
            </tr>
            <tr>
              <td>Web Development</td>
              <td>12 June 2026</td>
              <td>10:00 AM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Exam;