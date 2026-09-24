import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Holiday.css";

function Holiday() {
  const navigate = useNavigate();

  // LocalStorage se user data nikal rahe hain
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};

  // Database ke anusaar: role_id 2 Principal hai (jaisa aapke MySQL workbench me dikh raha hai)
  const rawRoleId = user?.role_id ?? user?.roleId ?? user?.role?.role_id ?? 4;
  const roleId = Number(rawRoleId);

  // Yahan hum check kar rahe hain ki roleId strictly 2 ho (Principal ke liye)
  const isPrincipal = roleId === 2;

  const [holidayList, setHolidayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holiday, setHoliday] = useState({
    holidayId: "",
    holidayDate: "",
    holidayName: ""
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get("http://localhost:8080/holidays/all", {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        res = await axios.get("http://localhost:8080/api/holidays", {
          headers: getAuthHeaders(),
        });
      }
      const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setHolidayList(data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleChange = (e) => {
    setHoliday({ ...holiday, [e.target.name]: e.target.value });
  };

  const saveHoliday = async (e) => {
    e.preventDefault();
    if (!isPrincipal) {
      alert("Access Denied: Sirf Principal hi holiday add kar sakte hain!");
      return;
    }

    try {
      try {
        await axios.post("http://localhost:8080/holidays/add", holiday, {
          headers: getAuthHeaders(),
        });
      } catch (e) {
        await axios.post("http://localhost:8080/api/holidays", holiday, {
          headers: getAuthHeaders(),
        });
      }
      alert("Holiday saved successfully!");
      setHoliday({ holidayId: "", holidayDate: "", holidayName: "" });
      fetchHolidays();
    } catch (error) {
      alert("Failed to save holiday.");
    }
  };

  return (
    <div className="holiday-page">
      <div className="holiday-card">
        {/* Header Component */}
        <div className="holiday-header">
          <h2>Holiday Module</h2>
          <p>
            {isPrincipal
              ? "Manage & Add Official College Holidays (Principal Access)"
              : "View Official College Holidays (Read-Only Access)"}
          </p>
        </div>

        {/* Form Section - Sirf Principal (roleId === 2) ke liye dikhega */}
        {isPrincipal && (
          <form onSubmit={saveHoliday} className="holiday-form">
            <h3>Add New Holiday</h3>
            <div className="input-row">
              <div className="form-group">
                <label>Holiday Date *</label>
                <input
                  type="date"
                  name="holidayDate"
                  value={holiday.holidayDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Holiday Name *</label>
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
              <button type="submit" className="save-btn">
                Save Holiday
              </button>
            </div>
          </form>
        )}

        {/* Directory List Table - Sabhi ke liye */}
        <div className="holiday-list-section">
          <div className="table-header-row">
            <h3>Holiday List</h3>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="reset-btn"
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="table-responsive">
            <table className="holiday-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Holiday Date</th>
                  <th>Holiday Name</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center">Loading holidays...</td>
                  </tr>
                ) : holidayList.length > 0 ? (
                  holidayList.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <span style={{ fontWeight: "700", color: "#6366f1" }}>
                          {idx + 1}
                        </span>
                      </td>
                      <td>{item.holidayDate || item.holiday_date || "-"}</td>
                      <td className="font-bold">{item.holidayName || item.holiday_name || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No holiday records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Holiday;