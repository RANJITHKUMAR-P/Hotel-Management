import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Hotel Management System
          </Link>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="hidden md:inline">Welcome, {currentUser.email}</span>
                {currentUser.role === 'admin' && (
                  <div className="flex space-x-2">
                    <Link to="/admin" className="hover:bg-blue-700 px-3 py-1 rounded transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/admin/rooms" className="hover:bg-blue-700 px-3 py-1 rounded transition-colors">
                      Rooms
                    </Link>
                    <Link to="/admin/bookings" className="hover:bg-blue-700 px-3 py-1 rounded transition-colors">
                      Bookings
                    </Link>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-900 px-3 py-1 rounded transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:bg-blue-700 px-3 py-1 rounded transition-colors">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;