<<<<<<< HEAD


=======
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
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
<<<<<<< HEAD
        // e.target.name aur e.target.value ko console karke check karein ki value aa rahi hai ya nahi
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
=======
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

<<<<<<< HEAD
        // Yahan console log karke check karein ki pura object ready hai ya nahi
        console.log("Final payload sending to backend:", JSON.stringify(formData, null, 2));

        try {
            const response = await axios.post('http://localhost:8080/api/users/register', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert("Registration Successful!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Full Error:", error);
            alert("Registration Failed! Check console for details.");
=======
        console.log("Submitting this data to backend:", formData);

        try {
            const response = await axios.post('http://localhost:8080/api/users/register', formData);
            alert("Registration Successful!");
            console.log("Backend Response:", response.data);
        } catch (error) {
            console.error("Error Details:", error.response ? error.response.data : error.message);
            alert("Registration Failed! Check console for errors.");
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>User Registration</h2>
            <form onSubmit={handleSubmit}>
<<<<<<< HEAD
                <input name="full_name" value={formData.full_name} placeholder="Full Name" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="emailId" value={formData.emailId} type="email" placeholder="Email" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="mobile_no" value={formData.mobile_no} placeholder="Mobile Number" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />

                <select name="role_id" value={formData.role_id} onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
=======
                <input name="full_name" placeholder="Full Name" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="emailId" type="email" placeholder="Email" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
                <input name="mobile_no" placeholder="Mobile Number" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />

                <select name="role_id" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }}>
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
                    <option value="">Select Role</option>
                    <option value="1">HOD</option>
                    <option value="2">Principal</option>
                    <option value="3">Professor</option>
                    <option value="4">Student</option>
                </select>

<<<<<<< HEAD
                <input name="password" value={formData.password} type="password" placeholder="Password" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
=======
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Register
                </button>
            </form>
        </div>
    );
};

<<<<<<< HEAD
export default Register;


=======
export default Register;
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
