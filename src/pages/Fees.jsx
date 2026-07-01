import React, { useState } from "react";
import axios from "axios";

function Fees() {

  const [fees, setFees] = useState({
    courseId: "",
    studentId: "",
    scholarship: "",
    discountPercentage: "",
    totalFees: "",
  });
const handleChange = async (e) => {

    const { name, value } = e.target;

    let updatedFees = {
        ...fees,
        [name]: value,
    };

    if (name === "courseId" && value !== "") {

        try {

            const response = await axios.get(
                `http://localhost:8080/api/courses/${value}`
            );

            const courseFee = response.data.course_fee;

            let scholarship = Number(updatedFees.scholarship) || 0;

            let discount = Number(updatedFees.discountPercentage) || 0;

            let total = courseFee - scholarship;

            total = total - ((total * discount) / 100);

            updatedFees.totalFees = total.toFixed(2);

        } catch (error) {

            console.log(error);

            updatedFees.totalFees = "";

        }

    }

    if (
        (name === "scholarship" || name === "discountPercentage")
        && updatedFees.courseId !== ""
    ) {

        try {

            const response = await axios.get(
                `http://localhost:8080/api/courses/${updatedFees.courseId}`
            );

            const courseFee = response.data.course_fee;

            let scholarship = Number(updatedFees.scholarship) || 0;

            let discount = Number(updatedFees.discountPercentage) || 0;

            let total = courseFee - scholarship;

            total = total - ((total * discount) / 100);

            updatedFees.totalFees = total.toFixed(2);

        } catch (error) {

            console.log(error);

        }

    }

    setFees(updatedFees);

};

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:8080/api/fees",
        fees
      );

      alert("Fees Saved Successfully");

      setFees({
        courseId: "",
        studentId: "",
        scholarship: "",
        discountPercentage: "",
        totalFees: "",
      });

    } catch (error) {

      console.log(error);
      alert("Failed To Save Fees");

    }

  };

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <h2 style={styles.heading}>
          Fees Management
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="number"
            name="studentId"
            placeholder="Enter Student ID"
            value={fees.studentId}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="number"
            name="courseId"
            placeholder="Enter Course ID"
            value={fees.courseId}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="number"
            step="0.01"
            name="scholarship"
            placeholder="Scholarship Amount"
            value={fees.scholarship}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="number"
            step="0.01"
            name="discountPercentage"
            placeholder="Discount Percentage"
            value={fees.discountPercentage}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="number"
            step="0.01"
            name="totalFees"
            placeholder="Total Fees"
            value={fees.totalFees}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button
            type="submit"
            style={styles.button}
          >
            Save Fees
          </button>

        </form>

      </div>

    </div>

  );
}

const styles = {
      container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "30px",
      },

      card: {
        width: "430px",
        backgroundColor: "#ffffff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
      },

      heading: {
        textAlign: "center",
        marginBottom: "25px",
        fontSize: "30px",
        fontWeight: "bold",
        color: "#111",
      },

      input: {
        width: "100%",
        padding: "12px",
        marginBottom: "18px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
      },

      button: {
        width: "100%",
        padding: "13px",
        backgroundColor: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.3s",
      }

    };

    export default Fees;