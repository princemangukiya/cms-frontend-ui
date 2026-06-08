import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        emailId: '',
        mobile_no: '',
        password: '',
        role_id: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting this data to backend:", formData);

        try {
            const response = await axios.post('http://localhost:8080/api/users/register', formData);
            alert("Registration Successful!");
            console.log("Backend Response:", response.data);
        } catch (error) {
            console.error("Error Details:", error.response ? error.response.data : error.message);
            alert("Registration Failed! Check console for errors.");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
                <input name="full_name" placeholder="Full Name" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="emailId" type="email" placeholder="Email" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="mobile_no" placeholder="Mobile Number" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />

                <select name="role_id" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
                    <option value="">Select Role</option>
                    <option value="1">HOD</option>
                    <option value="2">Principal</option>
                    <option value="3">Professor</option>
                    <option value="4">Student</option>
                </select>

                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;