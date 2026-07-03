import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Link import kiya

const Login = () => {
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        emailId: '',
        password: ''
    });

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/users/login', loginData);
            if (response.data) {
                localStorage.setItem("user", JSON.stringify(response.data));
                alert("Login Successful!");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: Invalid email or password!");
        }
    };

    const styles = {
        container: {
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#ffffff',
            padding: '20px'
        },
        card: {
            width: '100%', maxWidth: '400px', background: 'white', padding: '40px',
            borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', textAlign: 'center',
            border: '1px solid #f0f0f0'
        },
        input: {
            width: '100%', padding: '15px', margin: '10px 0', borderRadius: '12px',
            border: '2px solid #eee', outline: 'none', fontSize: '16px', boxSizing: 'border-box'
        },
        button: {
            width: '100%', padding: '15px', marginTop: '20px', background: '#764ba2',
            color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px',
            fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{ marginBottom: '25px', color: '#333' }}>Welcome Back</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" name="emailId" placeholder="Email Address" value={loginData.emailId} onChange={handleChange} required style={styles.input} />
                    <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleChange} required style={styles.input} />
                    <button type="submit" style={styles.button} onMouseOver={(e) => e.target.style.background = '#5a377d'} onMouseOut={(e) => e.target.style.background = '#764ba2'}>
                        Login Now
                    </button>
                </form>
                {/* Register Link Added Here */}
                <p style={{ marginTop: '20px', color: '#666' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#764ba2', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;