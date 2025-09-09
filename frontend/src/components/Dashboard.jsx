import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    activeBookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="loading"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-1">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            🛏️
          </div>
          <div className="stat-content">
            <h3>{stats.totalRooms}</h3>
            <p>Total Rooms</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            ✅
          </div>
          <div className="stat-content">
            <h3>{stats.availableRooms}</h3>
            <p>Available Rooms</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            📋
          </div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            🔄
          </div>
          <div className="stat-content">
            <h3>{stats.activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid-1 gap-2">
              <Link to="/admin/rooms" className="btn btn-primary">
                🛏️ Manage Rooms
              </Link>
              <Link to="/admin/bookings" className="btn btn-success">
                📋 Manage Bookings
              </Link>
              <Link to="/" className="btn btn-outline">
                🌐 View Public Site
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No recent activity to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;