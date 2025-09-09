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

  const handleBookNow = () => {
    if (location.pathname === '/') {
      // Scroll to booking section if we're on the home page
      const bookingSection = document.getElementById('booking-section');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="hotel-nav">
      <div className="hotel-nav-container">
        <Link to="/" className="hotel-nav-brand">
          <span className="nav-icon">🏨</span>
          <span className="nav-text">Luxury Hotels</span>
        </Link>
        
        <div className="hotel-nav-links">
          <button
            onClick={handleBookNow}
            className={`hotel-nav-link ${isActiveLink('/')}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Book Now</span>
          </button>
          
          {currentUser ? (
            <>
              <span className="user-welcome">Welcome, {currentUser.name || currentUser.email}</span>
              {currentUser.role === 'admin' && (
                <>
                  <Link 
                    to="/admin" 
                    className={`hotel-nav-link ${isActiveLink('/admin')}`}
                  >
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/rooms" 
                    className={`hotel-nav-link ${isActiveLink('/admin/rooms')}`}
                  >
                    <span className="nav-icon">🛏️</span>
                    <span className="nav-text">Rooms</span>
                  </Link>
                  <Link 
                    to="/admin/bookings" 
                    className={`hotel-nav-link ${isActiveLink('/admin/bookings')}`}
                  >
                    <span className="nav-icon">📋</span>
                    <span className="nav-text">Bookings</span>
                  </Link>
                </>
              )}
              <button 
                onClick={handleLogout}
                className="hotel-btn hotel-btn-outline"
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`hotel-nav-link ${isActiveLink('/login')}`}
            >
              <span className="nav-icon">🔐</span>
              <span className="nav-text">Admin Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;