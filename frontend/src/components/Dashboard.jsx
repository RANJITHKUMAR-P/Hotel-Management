import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    activeBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Rooms</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalRooms}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Available Rooms</h3>
          <p className="text-3xl font-bold mt-2">{stats.availableRooms}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Active Bookings</h3>
          <p className="text-3xl font-bold mt-2">{stats.activeBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/rooms" 
              className="block w-full bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition"
            >
              Manage Rooms
            </Link>
            <Link 
              to="/admin/bookings" 
              className="block w-full bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition"
            >
              Manage Bookings
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-gray-500 text-white text-center py-2 rounded hover:bg-gray-600 transition"
            >
              View Public Site
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;