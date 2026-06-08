<<<<<<< HEAD


=======
>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
                console.log("User_details:", response.data);


                localStorage.setItem("user", JSON.stringify(response.data));


                alert("Login Successful!");
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: Invalid email or password!");
        }
    };
<<<<<<< HEAD
=======

>>>>>>> 37e07997a82859b9e2b7fb9b7b43176546ac3611
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>User Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email Address:</label>
                    <input
                        type="email"
                        name="emailId"
                        value={loginData.emailId}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;