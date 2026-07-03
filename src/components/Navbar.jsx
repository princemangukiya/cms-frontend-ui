import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full p-6 flex justify-center gap-10 bg-transparent z-50">
            <Link to="/login" className="text-white font-bold text-lg hover:text-blue-300 transition">Login</Link>
            <Link to="/register" className="text-white font-bold text-lg hover:text-blue-300 transition">Register</Link>
        </nav>
    );
};
export default Navbar;
