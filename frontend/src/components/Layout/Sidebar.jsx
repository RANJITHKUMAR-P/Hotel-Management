import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏨</div>
        <div className="sidebar-brand-text">Luxury Hotels</div>
      </div>

      <nav className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <span className="sidebar-icon">🏠</span>
            <span>Home</span>
          </Link>
        </li>
        
        {currentUser ? (
          <>
            {currentUser.role === 'admin' && (
              <>
                <li className="sidebar-item">
                  <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
                    <span className="sidebar-icon">📊</span>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link to="/admin/rooms" className={`sidebar-link ${isActive('/admin/rooms') ? 'active' : ''}`}>
                    <span className="sidebar-icon">🛏️</span>
                    <span>Room Management</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link to="/admin/bookings" className={`sidebar-link ${isActive('/admin/bookings') ? 'active' : ''}`}>
                    <span className="sidebar-icon">📋</span>
                    <span>Booking Management</span>
                  </Link>
                </li>
              </>
            )}
            <li className="sidebar-item">
              <button onClick={handleLogout} className="sidebar-link">
                <span className="sidebar-icon">🚪</span>
                <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <li className="sidebar-item">
            <Link to="/login" className={`sidebar-link ${isActive('/login') ? 'active' : ''}`}>
              <span className="sidebar-icon">🔐</span>
              <span>Admin Login</span>
            </Link>
          </li>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;