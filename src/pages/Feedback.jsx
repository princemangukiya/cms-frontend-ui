import { useState } from "react";
import axios from "axios";

function Feedback() {

  const [feedback, setFeedback] = useState({
    feedbackFrom: "",
    feedbackTo: "",
    rating: "",
    feedbackMessage: "",
  });

  const handleChange = (e) => {
    setFeedback({
      ...feedback,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      console.log(feedback);

      const response = await axios.post(
        "http://localhost:8080/api/feedback",
        feedback
      );

      console.log(response.data);

      alert("Feedback Saved Successfully!");

      setFeedback({
        feedbackFrom: "",
        feedbackTo: "",
        rating: "",
        feedbackMessage: "",
      });

    } catch (error) {
      console.error(error);
      alert("Unable to Save Feedback");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h2 style={styles.heading}>Feedback Management</h2>

        <form onSubmit={handleSubmit}>

          <select
            name="feedbackFrom"
            value={feedback.feedbackFrom}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Feedback From</option>
            <option value="1">HOD</option>
            <option value="2">Principal</option>
            <option value="3">Professor</option>
            <option value="4">Student</option>
          </select>

          <select
            name="feedbackTo"
            value={feedback.feedbackTo}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Feedback To</option>
            <option value="1">HOD</option>
            <option value="2">Principal</option>
            <option value="3">Professor</option>
            <option value="4">Student</option>
          </select>

          <select
            name="rating"
            value={feedback.rating}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Select Rating</option>
            <option value="1">⭐ 1</option>
            <option value="2">⭐⭐ 2</option>
            <option value="3">⭐⭐⭐ 3</option>
            <option value="4">⭐⭐⭐⭐ 4</option>
            <option value="5">⭐⭐⭐⭐⭐ 5</option>
          </select>

          <textarea
            name="feedbackMessage"
            value={feedback.feedbackMessage}
            onChange={handleChange}
            placeholder="Enter Feedback Message"
            style={styles.textarea}
            required
          />

          <button type="submit" style={styles.button}>
            Save Feedback
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
    padding: "30px",
  },

  card: {
    width: "430px",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "15px",
    resize: "none",
    boxSizing: "border-box",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Feedback;