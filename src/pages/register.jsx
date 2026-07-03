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
        setFormData(prevData => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/users/register', formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert("Registration Successful!");
        } catch (error) {
            alert("Registration Failed!");
        }
    };

    // Inline styles for a modern, clean look
    const styles = {
        container: {
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '20px'
        },
        card: {
            width: '100%', maxWidth: '400px', background: 'white', padding: '40px',
            borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center'
        },
        input: {
            width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px',
            border: '2px solid #eee', outline: 'none', transition: '0.3s'
        },
        button: {
            width: '100%', padding: '12px', background: '#4a90e2', color: 'white',
            border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer',
            transition: '0.3s', fontWeight: 'bold'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginBottom: '25px', color: '#333' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input style={styles.input} name="full_name" value={formData.full_name} placeholder="Full Name" onChange={handleChange} required />
                    <input style={styles.input} name="emailId" value={formData.emailId} type="email" placeholder="Email Address" onChange={handleChange} required />
                    <input style={styles.input} name="mobile_no" value={formData.mobile_no} placeholder="Mobile Number" onChange={handleChange} required />

                    <select style={styles.input} name="role_id" value={formData.role_id} onChange={handleChange} required>
                        <option value="">Select Role</option>
                        <option value="1">HOD</option>
                        <option value="2">Principal</option>
                        <option value="3">Professor</option>
                        <option value="4">Student</option>
                    </select>

                    <input style={styles.input} name="password" value={formData.password} type="password" placeholder="Password" onChange={handleChange} required />

                    <button type="submit" style={styles.button} onMouseOver={(e) => e.target.style.background = '#357abd'} onMouseOut={(e) => e.target.style.background = '#4a90e2'}>
                        Register Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;