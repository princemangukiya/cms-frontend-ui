import { useState } from "react";
import axios from "axios";
import "../App.css";

function Staff() {
  const [staff, setStaff] = useState({
    staffid: "", staffname: "", designation: "", mobileno: "",
    gender: "", address: "", dob: "", email: "", joiningdate: "",
    salary: "", userid: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff(prev => ({
      ...prev,
      [name]: name === "salary" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/staff/add", staff);
      alert("Staff Saved Successfully!");
      setStaff({
        staffid: "", staffname: "", designation: "", mobileno: "",
        gender: "", address: "", dob: "", email: "", joiningdate: "",
        salary: "", userid: ""
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving staff! Check console.");
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h2>Staff Management</h2>
        <form onSubmit={handleSubmit} className="vertical-form">
          <input name="staffid" placeholder="Staff ID" value={staff.staffid} onChange={handleChange} required />
          <input name="staffname" placeholder="Staff Name" value={staff.staffname} onChange={handleChange} required />
          <input name="designation" placeholder="Designation" value={staff.designation} onChange={handleChange} />
          <input name="mobileno" placeholder="Mobile No" value={staff.mobileno} onChange={handleChange} />
          <input name="gender" placeholder="Gender" value={staff.gender} onChange={handleChange} />
          <input name="address" placeholder="Address" value={staff.address} onChange={handleChange} />
          <input type="date" name="dob" value={staff.dob} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={staff.email} onChange={handleChange} />
          <input type="date" name="joiningdate" value={staff.joiningdate} onChange={handleChange} />
          <input name="salary" type="number" placeholder="Salary" value={staff.salary} onChange={handleChange} />
          <input name="userid" placeholder="User ID" value={staff.userid} onChange={handleChange} />

          <button type="submit" className="submit-btn">Save Staff</button>
        </form>
      </div>
    </div>
  );
}

export default Staff;