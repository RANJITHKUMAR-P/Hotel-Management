import React, { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: 'single',
    pricePerNight: '',
    maxOccupancy: '',
    amenities: '',
    status: 'available'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const amenitiesArray = formData.amenities 
        ? formData.amenities.split(',').map(item => item.trim()) 
        : [];
      
      const roomData = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        maxOccupancy: Number(formData.maxOccupancy),
        amenities: amenitiesArray
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
      } else {
        await createRoom(roomData);
      }
      
      setShowForm(false);
      setEditingRoom(null);
      setFormData({
        roomNumber: '',
        type: 'single',
        pricePerNight: '',
        maxOccupancy: '',
        amenities: '',
        status: 'available'
      });
      
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      setError(error.response?.data?.error || 'Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      maxOccupancy: room.maxOccupancy,
      amenities: room.amenities ? room.amenities.join(', ') : '',
      status: room.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id);
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        setError('Failed to delete room');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      type: 'single',
      pricePerNight: '',
      maxOccupancy: '',
      amenities: '',
      status: 'available'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { class: 'badge-success', text: 'Available' },
      maintenance: { class: 'badge-warning', text: 'Maintenance' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="loading"></div>
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-1">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Room Management</h2>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            + Add New Room
          </button>
        </div>
        
        {error && (
          <div className="card-body">
            <div className="form-error">{error}</div>
          </div>
        )}
        
        {showForm && (
          <div className="card-body">
            <h3 className="mb-3">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
            <form onSubmit={handleSubmit} className="grid-2 gap-3">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Price Per Night ($)</label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Occupancy</label>
                <input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({...formData, maxOccupancy: e.target.value})}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="form-input"
                  placeholder="WiFi, TV, AC, etc."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="form-group grid-2">
                <button type="submit" className="btn btn-success">
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Rooms ({rooms.length})</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Type</th>
                <th>Price</th>
                <th>Max Guests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td className="capitalize">{room.type}</td>
                  <td>${room.pricePerNight}</td>
                  <td>{room.maxOccupancy}</td>
                  <td>{getStatusBadge(room.status)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(room)}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rooms.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🛏️</div>
              <p>No rooms found. Add your first room to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;