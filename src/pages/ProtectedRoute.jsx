import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const roleId = Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);

    if (!token) {
        return <Navigate to="/" replace />;
    }

    // 📚 Librarian (Role 5) strictly only has access to Dashboard, Profile, Library, and Book Issue
    if (roleId === 5) {
        const allowedLibrarianPaths = ['/dashboard', '/profile', '/library', '/book-issue'];
        if (!allowedLibrarianPaths.includes(location.pathname)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 💼 Placement Officer (Role 6) strictly only has access to Dashboard, Profile, Company Placement, and Placement Student
    if (roleId === 6) {
        const allowedPlacementPaths = ['/dashboard', '/profile', '/placement', '/placement-student'];
        if (!allowedPlacementPaths.includes(location.pathname)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 👔 HOD (Role 1) strictly has NO access to Payment
    if (roleId === 1) {
        if (location.pathname === '/payment') {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 👨‍🏫 Professor (Role 3) has authority over Students, but NO access to Staff, Fees, Payment, and Class Mgmt
    if (roleId === 3) {
        if (['/staff', '/fees', '/payment', '/class-mgmt'].includes(location.pathname)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 🎓 Student (Role 4) has NO access to Staff, Class Mgmt, and Book Issue
    if (roleId === 4) {
        if (['/staff', '/class-mgmt', '/book-issue'].includes(location.pathname)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Agar role allowed nahi hai, to dashboard redirect ho jayega
    if (allowedRoles && !allowedRoles.includes(roleId)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;