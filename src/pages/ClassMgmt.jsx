import React from 'react';

const ClassMgmt = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Class Management</h1>
      <p>Yahan aap classes aur subjects ko manage kar sakte hain.</p>

      {/* Basic Layout Example */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', flex: 1 }}>
          <h3>Add New Class</h3>
          <input type="text" placeholder="Class Name" style={{ display: 'block', marginBottom: '10px' }} />
          <button>Save Class</button>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '15px', flex: 2 }}>
          <h3>Existing Classes</h3>
          <ul>
            <li>Computer Science - Sem 1</li>
            <li>Information Tech - Sem 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassMgmt;