
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = (credentials) => api.post('/auth/login', credentials).then(res => res.data);
export const verifyToken = () => api.get('/auth/verify').then(res => res.data);
export const logoutUser = () => api.post('/auth/logout').then(res => res.data);

// Dashboard API calls
export const getDashboardStats = () => api.get('/dashboard/stats').then(res => res.data);

// Rooms API calls
export const getRooms = () => api.get('/rooms').then(res => res.data);
export const createRoom = (roomData) => api.post('/rooms', roomData).then(res => res.data);
export const updateRoom = (id, roomData) => api.put(`/rooms/${id}`, roomData).then(res => res.data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`).then(res => res.data);
// frontend/src/api.js - Add this function if it doesn't exist
export const getAvailableRooms = (checkIn, checkOut, guests) => 
  api.get(`/rooms/available?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)
    .then(res => res.data)
    .catch(error => {
      console.error('Error fetching available rooms:', error);
      throw error;
    });

// Bookings API calls
export const getBookings = () => api.get('/bookings').then(res => res.data);
export const createBooking = (bookingData) => api.post('/bookings', bookingData).then(res => res.data);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/${status}`).then(res => res.data);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`).then(res => res.data);

export default api;