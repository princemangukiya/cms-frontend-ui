import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Holiday.css"; // CSS File Import

function Holiday() {
  const navigate = useNavigate();
  const [holiday, setHoliday] = useState({
    holidayId: "",
    holidayDate: "",
    holidayName: ""
  });

  const handleChange = (e) => {
    setHoliday({ ...holiday, [e.target.name]: e.target.value });
  };

  const saveHoliday = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/holidays", holiday);
      alert("Holiday saved successfully!");
      setHoliday({ holidayId: "", holidayDate: "", holidayName: "" });
    } catch (error) {
      alert("Failed to save holiday.");
    }
  };

  return (
    <div className="holiday-page">
      <div className="holiday-card">
        <div className="holiday-header">
          <h2>Holiday Management</h2>
          <p>Add Official College Holidays</p>
        </div>

        <form onSubmit={saveHoliday}>
          <div className="input-row">
            <div className="form-group">
              <label>Holiday Date</label>
              <input
                type="date"
                name="holidayDate"
                value={holiday.holidayDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Holiday Name</label>
              <input
                type="text"
                name="holidayName"
                placeholder="Enter Holiday Name"
                value={holiday.holidayName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="reset-btn"
            >
              Back
            </button>
            <button
              type="submit"
              className="save-btn"
            >
              Save Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Holiday;