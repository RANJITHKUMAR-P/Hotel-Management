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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateSearchForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(searchData.checkIn);
    const checkOutDate = new Date(searchData.checkOut);

    if (checkInDate < today) {
      errors.checkIn = 'Check-in date cannot be in the past';
    }

    if (checkOutDate <= checkInDate) {
      errors.checkOut = 'Check-out date must be after check-in date';
    }

    if (parseInt(searchData.guests) < 1) {
      errors.guests = 'Number of guests must be at least 1';
    }

    return errors;
  };

  const validateBookingForm = () => {
    const errors = {};

    if (!bookingData.guestName.trim()) {
      errors.guestName = 'Guest name is required';
    } else if (bookingData.guestName.trim().length < 2) {
      errors.guestName = 'Guest name must be at least 2 characters';
    }

    if (!bookingData.guestEmail.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail)) {
      errors.guestEmail = 'Please enter a valid email address';
    }

    if (bookingData.guestPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(bookingData.guestPhone.replace(/[\s\-\(\)]/g, ''))) {
      errors.guestPhone = 'Please enter a valid phone number';
    }

    return errors;
  };

  const searchRooms = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    const searchErrors = validateSearchForm();
    if (Object.keys(searchErrors).length > 0) {
      setFieldErrors(searchErrors);
      setSearchLoading(false);
      return;
    }

    try {
      const rooms = await getAvailableRooms(searchData.checkIn, searchData.checkOut, searchData.guests);
      setAvailableRooms(rooms);
      setSelectedRoom(null);
      if (rooms.length === 0) {
        setError('No rooms available for the selected dates. Please try different dates.');
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
      setError(error.message || 'Failed to search for available rooms. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    const formErrors = validateBookingForm();
    if (Object.keys(formErrors).length > 0) {
      setFieldErrors(formErrors);
      setLoading(false);
      return;
    }

    if (!selectedRoom) {
      setError('Please select a room first');
      setLoading(false);
      return;
    }

    try {
      const booking = {
        ...bookingData,
        roomId: selectedRoom.id,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        numberOfGuests: parseInt(searchData.guests)
      };
      
      const result = await createBooking(booking);
      setSuccess(`Booking successful! Your booking ID: ${result.bookingId}. A confirmation email has been sent to ${bookingData.guestEmail}`);
      
      // Reset form
      setBookingData({
        guestName: '',
        guestEmail: '',
        guestPhone: ''
      });
      setSelectedRoom(null);
      setAvailableRooms([]);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = (room) => {
    const nights = differenceInDays(new Date(searchData.checkOut), new Date(searchData.checkIn));
    return nights * room.pricePerNight;
  };

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user changes search criteria
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Book Your Stay</h1>
        
        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Find Available Rooms</h2>
          <form onSubmit={searchRooms} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Check-in *</label>
              <input 
                type="date" 
                className={`w-full border p-2 rounded ${fieldErrors.checkIn ? 'border-red-500' : 'border-gray-300'}`}
                value={searchData.checkIn}
                onChange={(e) => handleSearchChange('checkIn', e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
              {fieldErrors.checkIn && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.checkIn}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Check-out *</label>
              <input 
                type="date" 
                className={`w-full border p-2 rounded ${fieldErrors.checkOut ? 'border-red-500' : 'border-gray-300'}`}
                value={searchData.checkOut}
                onChange={(e) => handleSearchChange('checkOut', e.target.value)}
                min={format(addDays(new Date(searchData.checkIn), 1), 'yyyy-MM-dd')}
                required
              />
              {fieldErrors.checkOut && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.checkOut}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-600">Guests *</label>
              <select 
                className={`w-full border p-2 rounded ${fieldErrors.guests ? 'border-red-500' : 'border-gray-300'}`}
                value={searchData.guests}
                onChange={(e) => handleSearchChange('guests', e.target.value)}
                required
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
              {fieldErrors.guests && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.guests}</p>
              )}
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : 'Search Rooms'}
              </button>
            </div>
          </form>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Available Rooms */}
        {availableRooms.length > 0 && (
  <div className="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Rooms</h2>
    <p className="text-gray-600 mb-4">Select a room to continue with your booking:</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableRooms.map(room => (
        <div 
          key={room.id} 
          className={`border p-4 rounded-lg transition-all duration-200 ${
            selectedRoom?.id === room.id 
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 transform scale-105 shadow-lg' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
          }`}
          onClick={() => setSelectedRoom(room)}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="font-semibold text-lg mb-2 text-gray-800">Room {room.roomNumber}</h3>
          <p className="text-gray-600 capitalize mb-1">
            <span className="font-medium">Type:</span> {room.type}
          </p>
          <p className="text-gray-600 mb-1">
            <span className="font-medium">Max Guests:</span> {room.maxOccupancy}
          </p>
          {room.amenities && room.amenities.length > 0 && (
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Amenities:</span> {room.amenities.join(', ')}
            </p>
          )}
          <p className="text-2xl font-bold text-green-600 mb-2">
            ${room.pricePerNight}/night
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Total: ${calculateTotalCost(room)} for {
              differenceInDays(new Date(searchData.checkOut), new Date(searchData.checkIn))
            } nights
          </p>
          {selectedRoom?.id === room.id && (
            <div className="mt-3 text-blue-600 font-semibold flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Selected
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Complete Your Booking</h2>
            <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Guest Name *</label>
                <input
                  type="text"
                  className={`w-full border p-2 rounded ${fieldErrors.guestName ? 'border-red-500' : 'border-gray-300'}`}
                  value={bookingData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
                {fieldErrors.guestName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.guestName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Email *</label>
                <input
                  type="email"
                  className={`w-full border p-2 rounded ${fieldErrors.guestEmail ? 'border-red-500' : 'border-gray-300'}`}
                  value={bookingData.guestEmail}
                  onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
                {fieldErrors.guestEmail && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.guestEmail}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Phone Number</label>
                <input
                  type="tel"
                  className={`w-full border p-2 rounded ${fieldErrors.guestPhone ? 'border-red-500' : 'border-gray-300'}`}
                  value={bookingData.guestPhone}
                  onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                  placeholder="Enter your phone number (optional)"
                />
                {fieldErrors.guestPhone && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.guestPhone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
                  <h3 className="font-semibold mb-3 text-gray-700 text-lg">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">Room {selectedRoom.roomNumber} ({selectedRoom.type})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{format(new Date(searchData.checkIn), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{format(new Date(searchData.checkOut), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span className="font-medium">{differenceInDays(new Date(searchData.checkOut), new Date(searchData.checkIn))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-medium">{searchData.guests}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${calculateTotalCost(selectedRoom)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded w-full hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}

        {availableRooms.length === 0 && !searchLoading && !selectedRoom && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500 text-lg mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              {availableRooms.length === 0 && searchData.checkIn && searchData.checkOut
                ? 'No rooms available for the selected dates. Please try different dates.'
                : 'Search for available rooms to get started'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;