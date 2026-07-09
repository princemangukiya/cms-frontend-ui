import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Library = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bookname: "",
    authorname: "",
    booklanguage: "",
    totalbook: "",
    bookprice: ""
  });

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "http://localhost:8080/api/library",
        {
          bookname: formData.bookname,
          authorname: formData.authorname,
          booklanguage: formData.booklanguage,
          totalbook: Number(formData.totalbook),
          bookprice: Number(formData.bookprice)
        }
      );

      console.log(response.data);

      alert("Book Details Saved Successfully!");

      setFormData({
        bookname: "",
        authorname: "",
        booklanguage: "",
        totalbook: "",
        bookprice: ""
      });

    } catch (error) {

      console.error("Error :", error);

      if (error.response) {
        console.error(error.response.data);
        alert("Backend Error : " + error.response.data);
      } else {
        alert("Error : " + error.message);
      }

    }

  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Library Management</h2>
          <p style={{ marginTop: 5 }}>
            Add New Book Details
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.grid}>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Book Name</label>

              <input
                type="text"
                value={formData.bookname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookname: e.target.value
                  })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Author Name</label>

              <input
                type="text"
                value={formData.authorname}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authorname: e.target.value
                  })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Language</label>

              <input
                type="text"
                value={formData.booklanguage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    booklanguage: e.target.value
                  })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Total Books</label>

              <input
                type="number"
                value={formData.totalbook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalbook: e.target.value
                  })
                }
                style={styles.input}
                required
              />
            </div>

            <div style={{ ...styles.fieldWrapper, gridColumn: "span 2" }}>
              <label style={styles.label}>Book Price</label>

              <input
                type="number"
                value={formData.bookprice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookprice: e.target.value
                  })
                }
                style={styles.input}
                required
              />
            </div>

          </div>

          <div style={styles.buttonGroup}>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>

            <button
              type="submit"
              style={styles.saveButton}
            >
              Save Book
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
    display: "flex",
    justifyContent: "center",
    padding: "40px"
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
    color: "#fff",
    textAlign: "center",
    padding: "30px"
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
    flexDirection: "column"
  },

  label: {
    fontWeight: "bold",
    marginBottom: "5px"
  },

  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px"
  },

  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px"
  },

  saveButton: {
    padding: "12px 40px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  backButton: {
    padding: "12px 40px",
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default Library;