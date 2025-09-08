import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, cancelBooking } from '../api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

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
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error('Error canceling booking:', error);
        setError('Failed to cancel booking');
      }
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Bookings</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guests
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {booking.bookingId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{booking.guestName}</div>
                  <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.roomNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{formatDate(booking.checkIn?.seconds ? booking.checkIn.seconds * 1000 : booking.checkIn)}</div>
                  <div className="text-sm text-gray-500">to {formatDate(booking.checkOut?.seconds ? booking.checkOut.seconds * 1000 : booking.checkOut)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.numberOfGuests}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${booking.totalCost}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'checkin')}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      Check In
                    </button>
                  )}
                  {booking.status === 'checked-in' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'checkout')}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Check Out
                    </button>
                  )}
                  {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;