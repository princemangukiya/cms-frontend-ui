import React from 'react';

const CompanyPlacement = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Company Placement</h1>
      <p>Yahan aane wali companies aur placement drive ki details hongi.</p>

      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>Upcoming Drives</h3>
        <ul>
          <li><strong>Google</strong> - Date: 15 June 2026</li>
          <li><strong>Microsoft</strong> - Date: 20 June 2026</li>
          <li><strong>TCS</strong> - Date: 25 June 2026</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Placement Statistics</h3>
        <p>Total Students Placed: 120</p>
        <p>Highest Package: 25 LPA</p>
      </div>
    </div>
  );
};

export default CompanyPlacement;