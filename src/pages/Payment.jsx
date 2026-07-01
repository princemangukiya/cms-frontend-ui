import { useState } from "react";
import axios from "axios";
import "./Payment.css";

function Payment() {
  const [payment, setPayment] = useState({
    feeId: "",
    studentId: "",
    paidAmount: "",
    date: "",
    paymentMode: "",
    transactionId: "",
    status: ""
  });

  const handleChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value
    });
  };

  const savePayment = async (e) => {
    e.preventDefault();

    if (
      !payment.feeId ||
      !payment.studentId ||
      !payment.paidAmount ||
      !payment.date ||
      !payment.paymentMode ||
      !payment.transactionId ||
      !payment.status
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/payments", payment);

      alert("Payment Saved Successfully!");

      setPayment({
        feeId: "",
        studentId: "",
        paidAmount: "",
        date: "",
        paymentMode: "",
        transactionId: "",
        status: ""
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save payment.");
    }
  };

  const resetForm = () => {
    setPayment({
      feeId: "",
      studentId: "",
      paidAmount: "",
      date: "",
      paymentMode: "",
      transactionId: "",
      status: ""
    });
  };

  return (
    <div className="payment-page">

      <div className="payment-card">

        <div className="payment-header">
          <h2>💳 Payment Management</h2>
          <p>Manage Student Fee Payments</p>
        </div>

        <form onSubmit={savePayment}>

          <div className="input-row">

            <div className="form-group">
              <label>Fee ID</label>
              <input
                type="number"
                name="feeId"
                placeholder="Enter Fee ID"
                value={payment.feeId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Student ID</label>
              <input
                type="number"
                name="studentId"
                placeholder="Enter Student ID"
                value={payment.studentId}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-row">

            <div className="form-group">
              <label>Paid Amount</label>
              <input
                type="number"
                name="paidAmount"
                placeholder="Enter Paid Amount"
                value={payment.paidAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                name="date"
                value={payment.date}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-row">

            <div className="form-group">
              <label>Payment Mode</label>
              <select
                name="paymentMode"
                value={payment.paymentMode}
                onChange={handleChange}
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="form-group">
              <label>Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                placeholder="Enter Transaction ID"
                value={payment.transactionId}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-row">

            <div className="form-group full-width">
              <label>Status</label>
              <select
                name="status"
                value={payment.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

          </div>

          <div className="button-group">

            <button
              type="submit"
              className="save-btn"
            >
              💾 Save Payment
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

export default Payment;