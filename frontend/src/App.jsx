// import BookingForm from './components/Guest/BookingForm';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import RoomManagement from './components/RoomManagement';
import BookingManagement from './components/BookingManagement';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
      
          <Routes>
            <Route path="/" element={<Home />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;