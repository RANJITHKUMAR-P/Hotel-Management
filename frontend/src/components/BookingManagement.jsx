import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, cancelBooking } from '../api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setSuccess('Booking status updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        setSuccess('Booking cancelled successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchBookings();
      } catch (error) {
        console.error('Error canceling booking:', error);
        setError('Failed to cancel booking');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'badge-primary', icon: '✅', text: 'Confirmed' },
      'checked-in': { class: 'badge-success', icon: '🏨', text: 'Checked In' },
      'checked-out': { class: 'badge-info', icon: '🚪', text: 'Checked Out' },
      cancelled: { class: 'badge-danger', icon: '❌', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', icon: '❓', text: status };
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const calculateNights = (checkIn, checkOut) => {
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="loading"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-1">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Booking Management</h2>
          <div className="flex items-center gap-3">
            <span className="text-muted">{bookings.length} total bookings</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-input"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {(error || success) && (
          <div className="card-body">
            {error && (
              <div className="form-error">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                ✅ {success}
              </div>
            )}
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Information</th>
                <th>Room</th>
                <th>Dates & Nights</th>
                <th>Guests</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const nights = calculateNights(
                  booking.checkIn?.seconds ? booking.checkIn.seconds * 1000 : booking.checkIn,
                  booking.checkOut?.seconds ? booking.checkOut.seconds * 1000 : booking.checkOut
                );
                
                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="font-mono text-sm">{booking.bookingId}</div>
                      <div className="text-xs text-muted">
                        {formatDate(booking.createdAt?.seconds ? booking.createdAt.seconds * 1000 : booking.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{booking.guestName}</div>
                      <div className="text-sm text-muted">{booking.guestEmail}</div>
                      {booking.guestPhone && (
                        <div className="text-sm text-muted">📞 {booking.guestPhone}</div>
                      )}
                    </td>
                    <td>
                      <div className="font-medium">Room {booking.roomNumber}</div>
                      <div className="text-sm text-muted capitalize">{booking.roomType}</div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div>
                          <span className="text-sm text-muted">Check-in: </span>
                          {formatDate(booking.checkIn?.seconds ? booking.checkIn.seconds * 1000 : booking.checkIn)}
                        </div>
                        <div>
                          <span className="text-sm text-muted">Check-out: </span>
                          {formatDate(booking.checkOut?.seconds ? booking.checkOut.seconds * 1000 : booking.checkOut)}
                        </div>
                        <div className="badge badge-secondary">
                          🌙 {nights} night{nights !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-center">
                        <span className="text-xl font-bold">{booking.numberOfGuests}</span>
                        <div className="text-sm text-muted">guest{booking.numberOfGuests !== 1 ? 's' : ''}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-green-600">${booking.totalCost}</div>
                    </td>
                    <td>
                      {getStatusBadge(booking.status)}
                    </td>
                    <td>
                      <div className="flex flex-col gap-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'checkin')}
                            className="btn btn-success btn-sm"
                          >
                            ✅ Check In
                          </button>
                        )}
                        {booking.status === 'checked-in' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'checkout')}
                            className="btn btn-primary btn-sm"
                          >
                            🚪 Check Out
                          </button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="btn btn-danger btn-sm"
                          >
                            ❌ Cancel
                          </button>
                        )}
                        {(booking.status === 'checked-out' || booking.status === 'cancelled') && (
                          <span className="text-sm text-muted">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>
                {filter === 'all' 
                  ? 'No bookings found.' 
                  : `No ${filter} bookings found.`}
              </p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="btn btn-outline mt-3"
                >
                  View All Bookings
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            📋
          </div>
          <div className="stat-content">
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            ✅
          </div>
          <div className="stat-content">
            <h3>{bookings.filter(b => b.status === 'confirmed').length}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            🏨
          </div>
          <div className="stat-content">
            <h3>{bookings.filter(b => b.status === 'checked-in').length}</h3>
            <p>Checked In</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            💰
          </div>
          <div className="stat-content">
            <h3>${bookings.reduce((total, booking) => total + (booking.totalCost || 0), 0)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;