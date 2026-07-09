import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlacementStudent = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company_id: "",
        student_id: "",
        interview_date: "",
        status: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const payload = {
                company_id: Number(formData.company_id),
                student_id: Number(formData.student_id),
                interview_date: formData.interview_date,
                status: formData.status
            };

            console.log("Sending Data :", payload);

            const response = await axios.post(
                "http://localhost:8080/api/placement",
                payload
            );

            console.log(response.data);

            alert("Placement Details Saved Successfully!");

            setFormData({
                company_id: "",
                student_id: "",
                interview_date: "",
                status: ""
            });

        } catch (error) {

            console.error("Full Error :", error);

            if (error.response) {

                console.log("Status :", error.response.status);
                console.log("Backend Error :", error.response.data);

                alert("Error : " + JSON.stringify(error.response.data));

            } else {

                alert("Error : " + error.message);

            }

        }

    };

    return (
        <div style={styles.page}>

            <div style={styles.card}>

                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>
                        Placement Management
                    </h2>

                    <p style={{
                        margin: "5px 0 0 0",
                        opacity: 0.8
                    }}>
                        Add Student Placement Details
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>

                    <div style={styles.grid}>

                        <div style={styles.fieldWrapper}>
                            <label style={styles.label}>
                                Company ID
                            </label>

                            <input
                                type="number"
                                name="company_id"
                                value={formData.company_id}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.fieldWrapper}>
                            <label style={styles.label}>
                                Student ID
                            </label>

                            <input
                                type="number"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.fieldWrapper}>
                            <label style={styles.label}>
                                Interview Date
                            </label>

                            <input
                                type="date"
                                name="interview_date"
                                value={formData.interview_date}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.fieldWrapper}>
                            <label style={styles.label}>
                                Status
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            >
                                <option value="">
                                    Select Status
                                </option>

                                <option value="Selected">
                                    Selected
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                            </select>
                        </div>

                    </div>

                    <div style={styles.buttonGroup}>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            style={styles.backButton}
                        >
                            Back
                        </button>

                        <button
                            type="submit"
                            style={styles.saveButton}
                        >
                            Save Details
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );

};

const styles = {

    page: {
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "40px",
        display: "flex",
        justifyContent: "center"
    },

    card: {
        width: "100%",
        maxWidth: "600px",
        background: "#fff",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
    },

    header: {
        background: "#4a90e2",
        padding: "30px",
        color: "#fff",
        textAlign: "center"
    },

    form: {
        padding: "30px"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
    },

    fieldWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "5px"
    },

    label: {
        fontSize: "12px",
        fontWeight: "bold",
        color: "#666"
    },

    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
        width: "100%",
        boxSizing: "border-box"
    },

    buttonGroup: {
        display: "flex",
        gap: "15px",
        marginTop: "30px",
        justifyContent: "center"
    },

    saveButton: {
        padding: "12px 40px",
        background: "#4a90e2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
    },

    backButton: {
        padding: "12px 40px",
        background: "#e74c3c",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
    }

};

export default PlacementStudent;