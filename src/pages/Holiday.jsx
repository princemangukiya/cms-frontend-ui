import { useState } from "react";
import axios from "axios";
import "./Holiday.css";

function Holiday() {
  const [holiday, setHoliday] = useState({
    holidayId: "",
    holidayDate: "",
    holidayName: "",
  });

  const handleChange = (e) => {
    setHoliday({
      ...holiday,
      [e.target.name]: e.target.value,
    });
  };

  const saveHoliday = async (e) => {
    e.preventDefault();

    if (!holiday.holidayDate || !holiday.holidayName) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/holidays", holiday);

      alert("Holiday save Successfully!");

      setHoliday({
        holidayId: "",
        holidayDate: "",
        holidayName: "",
      });

    } catch (error) {
      console.error(error);
      alert("Failed to save holiday.");
    }
  };

  return (
    <div className="holiday-page">

      <div className="holiday-card">

        <div className="holiday-header">
          <h2>📅 Holiday Management</h2>
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

            <button className="save-btn">
              💾 Save Holiday
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={() =>
                setHoliday({
                  holidayId: "",
                  holidayDate: "",
                  holidayName: "",
                })
              }
            >
              🔄 Reset
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Holiday;