import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // 1. LocalStorage se user data lein
    const userData = localStorage.getItem("user");

    // 2. Validate karein: kya data exist karta hai aur kya wo valid hai?
    let isAuthenticated = false;
    try {
        if (userData) {
            const user = JSON.parse(userData);
            // Optional: Yahan aap 'user.user_id' ya koi aur field bhi check kar sakte hain
            if (user && user.user_id) {
                isAuthenticated = true;
            }
        }
    } catch (error) {
        console.error("Invalid user data in localStorage", error);
        isAuthenticated = false;
    }

    // 3. Agar authenticated hai to page dikhayein, warna login par bhej dein
    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;