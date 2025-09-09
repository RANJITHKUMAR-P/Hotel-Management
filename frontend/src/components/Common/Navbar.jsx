// Update your Navbar.jsx to include public links
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

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center">
            🏨 Hotel Management System
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Public link to booking page */}
            <Link to="/" className="hover:bg-blue-700 px-3 py-1 rounded transition-colors">
              Book Now
            </Link>
            
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
                  className="bg-blue-700 hover:bg-blue-900 px-3 py-1 rounded transition-colors"
                >
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