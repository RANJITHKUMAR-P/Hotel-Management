import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuToggle }) => {
  const { currentUser } = useAuth();
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();

  return (
    <header className="header">
      <div>
        <h1 className="header-title">Hotel Management System</h1>
        <p className="text-muted">{currentDate} • {currentTime}</p>
      </div>
      
      <div className="header-actions">
        {currentUser && (
          <div className="user-info">
            <span className="text-primary">Welcome, {currentUser.name || currentUser.email}</span>
            {currentUser.role === 'admin' && (
              <span className="badge badge-primary ml-2">Administrator</span>
            )}
          </div>
        )}
     
      </div>
    </header>
  );
};

export default Header;