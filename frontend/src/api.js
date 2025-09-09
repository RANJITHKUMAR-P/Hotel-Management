import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth errors and general error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hotelUser');
      window.location.href = '/login';
    }
    
    // Enhanced error handling
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error: Unable to connect to the server';
    } else {
      // Something else happened
      errorMessage = error.message;
    }
    
    // Create a enhanced error object
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    return Promise.reject(enhancedError);
  }
);

// Auth API calls
export const loginUser = (credentials) => 
  api.post('/auth/login', credentials)
    .then(res => res.data)
    .catch(error => {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    });

export const verifyToken = () => 
  api.get('/auth/verify')
    .then(res => res.data)
    .catch(error => {
      console.error('Token verification error:', error);
      throw new Error(error.message || 'Failed to verify token');
    });

export const logoutUser = () => 
  api.post('/auth/logout')
    .then(res => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hotelUser');
      return res.data;
    })
    .catch(error => {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hotelUser');
      throw new Error(error.message || 'Failed to logout');
    });

// Dashboard API calls
export const getDashboardStats = () => 
  api.get('/dashboard/stats')
    .then(res => res.data)
    .catch(error => {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.message || 'Failed to fetch dashboard statistics');
    });

// Rooms API calls
export const getRooms = () => 
  api.get('/rooms')
    .then(res => res.data)
    .catch(error => {
      console.error('Error fetching rooms:', error);
      throw new Error(error.message || 'Failed to fetch rooms');
    });

export const createRoom = (roomData) => 
  api.post('/rooms', roomData)
    .then(res => res.data)
    .catch(error => {
      console.error('Error creating room:', error);
      throw new Error(error.message || 'Failed to create room');
    });

export const updateRoom = (id, roomData) => 
  api.put(`/rooms/${id}`, roomData)
    .then(res => res.data)
    .catch(error => {
      console.error('Error updating room:', error);
      throw new Error(error.message || 'Failed to update room');
    });

export const deleteRoom = (id) => 
  api.delete(`/rooms/${id}`)
    .then(res => res.data)
    .catch(error => {
      console.error('Error deleting room:', error);
      throw new Error(error.message || 'Failed to delete room');
    });

export const getAvailableRooms = (checkIn, checkOut, guests) => 
  api.get(`/rooms/available?checkin=${checkIn}&checkout=${checkOut}&guests=${guests || 1}`)
    .then(res => res.data)
    .catch(error => {
      console.error('Error fetching available rooms:', error);
      throw new Error(error.message || 'Failed to fetch available rooms');
    });

// Bookings API calls
export const getBookings = () => 
  api.get('/bookings')
    .then(res => res.data)
    .catch(error => {
      console.error('Error fetching bookings:', error);
      throw new Error(error.message || 'Failed to fetch bookings');
    });

export const createBooking = (bookingData) => 
  api.post('/bookings', bookingData)
    .then(res => res.data)
    .catch(error => {
      console.error('Error creating booking:', error);
      throw new Error(error.message || 'Failed to create booking');
    });

// Update booking status with enhanced error handling
export const updateBookingStatus = async (id, status) => {
  try {
    let endpoint;
    switch (status) {
      case 'checkin':
        endpoint = `checkin`;
        break;
      case 'checkout':
        endpoint = `checkout`;
        break;
      default:
        throw new Error('Invalid status action');
    }
    
    const response = await api.put(`/bookings/${id}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error updating booking status to ${status}:`, error);
    throw new Error(error.message || `Failed to ${status} booking`);
  }
};

// Cancel booking with enhanced error handling
export const cancelBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw new Error(error.message || 'Failed to cancel booking');
  }
};

// Health check API call
export const checkApiHealth = () => 
  api.get('/health')
    .then(res => res.data)
    .catch(error => {
      console.error('API health check failed:', error);
      throw new Error(error.message || 'API health check failed');
    });

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Utility function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Utility function to set auth data
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('hotelUser', JSON.stringify(user));
};

// Utility function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('hotelUser');
};

export default api;