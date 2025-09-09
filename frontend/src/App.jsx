import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import BookingManagement from './components/BookingManagement';
import PublicBooking from './pages/PublicBooking';
import Home from './pages/Home';
import './styles/hotel.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} />
          <div className="main-content">
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            <Routes>
              <Route path="/" element={<PublicBooking />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute role="admin">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/rooms" element={
                <ProtectedRoute role="admin">
                  <RoomManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute role="admin">
                  <BookingManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;