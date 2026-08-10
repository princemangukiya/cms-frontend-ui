import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, GraduationCap } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 w-full px-8 py-4 flex justify-between items-center bg-slate-900/60 backdrop-blur-md border-b border-white/10 z-50 transition-all duration-300">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                    CMS <span className="text-blue-500">Portal</span>
                </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
                <Link
                    to="/login"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive('/login')
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                </Link>

                <Link
                    to="/register"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isActive('/register')
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/20'
                    }`}
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;