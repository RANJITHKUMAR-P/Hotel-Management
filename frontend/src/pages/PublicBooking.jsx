// frontend/src/pages/PublicBooking.jsx
import React, { useState } from 'react';
import { getAvailableRooms, createBooking } from '../api';
import { format, addDays, differenceInDays } from 'date-fns';

const PublicBooking = () => {
  const [searchData, setSearchData] = useState({
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 1
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const searchRooms = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const rooms = await getAvailableRooms(searchData.checkIn, searchData.checkOut, searchData.guests);
      setAvailableRooms(rooms);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error searching rooms:', error);
      setError('Failed to search for available rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!selectedRoom) {
        setError('Please select a room first');
        return;
      }

      if (!bookingData.guestName || !bookingData.guestEmail) {
        setError('Please fill in all required fields');
        return;
      }

      const booking = {
        ...bookingData,
        roomId: selectedRoom.id,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        numberOfGuests: parseInt(searchData.guests)
      };
      
      const result = await createBooking(booking);
      setSuccess(`Booking successful! Your booking ID: ${result.bookingId}`);
      
      // Reset form
      setBookingData({
        guestName: '',
        guestEmail: '',
        guestPhone: ''
      });
      setSelectedRoom(null);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = (room) => {
    const nights = differenceInDays(new Date(searchData.checkOut), new Date(searchData.checkIn));
    return nights * room.pricePerNight;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Your Stay</h1>
      
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Find Available Rooms</h2>
        <form onSubmit={searchRooms} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded"
              value={searchData.checkIn}
              onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Check-out</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded"
              value={searchData.checkOut}
              onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Guests</label>
            <select 
              className="w-full border p-2 rounded"
              value={searchData.guests}
              onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
              required
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Rooms'}
            </button>
          </div>
        </form>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Available Rooms */}
      {availableRooms.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.map(room => (
              <div 
                key={room.id} 
                className={`border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedRoom?.id === room.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <h3 className="font-semibold text-lg mb-2">Room {room.roomNumber}</h3>
                <p className="text-gray-600 capitalize mb-1">Type: {room.type}</p>
                <p className="text-gray-600 mb-1">Max Guests: {room.maxOccupancy}</p>
                <p className="text-gray-600 mb-2">Amenities: {room.amenities?.join(', ') || 'None'}</p>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  ${room.pricePerNight}/night
                </p>
                <p className="text-lg font-semibold">
                  Total: ${calculateTotalCost(room)} for {
                    differenceInDays(new Date(searchData.checkOut), new Date(searchData.checkIn))
                  } nights
                </p>
                {selectedRoom?.id === room.id && (
                  <div className="mt-3 text-blue-600 font-semibold">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {selectedRoom && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Complete Your Booking</h2>
          <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Guest Name *</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={bookingData.guestName}
                onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={bookingData.guestEmail}
                onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full border p-2 rounded"
                value={bookingData.guestPhone}
                onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="md:col-span-2">
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <p>Room: {selectedRoom.roomNumber} ({selectedRoom.type})</p>
                <p>Dates: {format(new Date(searchData.checkIn), 'MMM dd, yyyy')} - {format(new Date(searchData.checkOut), 'MMM dd, yyyy')}</p>
                <p>Guests: {searchData.guests}</p>
                <p className="text-lg font-bold mt-2">
                  Total: ${calculateTotalCost(selectedRoom)}
                </p>
              </div>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded w-full hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {availableRooms.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">
            {selectedRoom ? 'Complete your booking above' : 'Search for available rooms to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicBooking;