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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to fetch rooms');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Process amenities
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Room Management</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Room
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full border p-2 rounded"
                required
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price Per Night ($)</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})}
                className="w-full border p-2 rounded"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Max Occupancy</label>
              <input
                type="number"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData({...formData, maxOccupancy: e.target.value})}
                className="w-full border p-2 rounded"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Amenities (comma separated)</label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                className="w-full border p-2 rounded"
                placeholder="WiFi, TV, AC, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border p-2 rounded"
                required
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex space-x-2">
              <button 
                type="submit" 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Occupancy
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
            {rooms.map(room => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.roomNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {room.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${room.pricePerNight}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {room.maxOccupancy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rooms found. Add your first room to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomManagement;