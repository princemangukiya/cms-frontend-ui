import { useState } from "react";
import axios from "axios";
import "./CompanyPlacement.css";

function CompanyPlacement() {

  const [company, setCompany] = useState({
    companyName: "",
    location: "",
    jobRole: "",
    packageLpa: "",
    website: ""
  });

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value
    });
  };

  const saveCompany = async (e) => {
    e.preventDefault();

    if (
      !company.companyName ||
      !company.location ||
      !company.jobRole ||
      !company.packageLpa ||
      !company.website
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {

      await axios.post(
        "http://localhost:8080/api/companyplacements",
        company
      );

      alert("Company Details Saved Successfully!");

      setCompany({
        companyName: "",
        location: "",
        jobRole: "",
        packageLpa: "",
        website: ""
      });

    } catch (error) {

      console.log("Error :", error);

      if (error.response) {
        console.log(error.response.data);
      }

      alert("Failed to Save Company Details.");
    }
  };

  const resetForm = () => {
    setCompany({
      companyName: "",
      location: "",
      jobRole: "",
      packageLpa: "",
      website: ""
    });
  };

  return (
    <div className="company-page">

      <div className="company-card">

        <div className="company-header">
          <h2>🏢 Company Placement</h2>
          <p>Add Placement Company Details</p>
        </div>

        <form onSubmit={saveCompany}>

          <div className="input-row">

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="Enter Company Name"
                value={company.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter Company Location"
                value={company.location}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-row">

            <div className="form-group">
              <label>Job Role</label>
              <input
                type="text"
                name="jobRole"
                placeholder="Enter Job Role"
                value={company.jobRole}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Package (LPA)</label>
              <input
                type="number"
                step="0.01"
                name="packageLpa"
                placeholder="Enter Package"
                value={company.packageLpa}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-row">

            <div className="form-group full-width">
              <label>Company Website</label>
              <input
                type="url"
                name="website"
                placeholder="https://company.com"
                value={company.website}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="button-group">

            <button
              type="submit"
              className="save-btn"
            >
              💾 Save Company
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={resetForm}
            >
              🔄 Reset
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CompanyPlacement;