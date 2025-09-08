import { useState, useEffect } from "react";
import API from "../api";

function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ number: "", type: "", price: "" });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await API.post("/rooms", newRoom);
      setNewRoom({ number: "", type: "", price: "" });
      fetchRooms();
    } catch (err) {
      console.error("Failed to add room:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Add Room Form */}
      <form onSubmit={handleAddRoom} className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Room</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Room Number"
            className="border p-2 rounded"
            value={newRoom.number}
            onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Room Type"
            className="border p-2 rounded"
            value={newRoom.type}
            onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={newRoom.price}
            onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Room
        </button>
      </form>

      {/* Rooms List */}
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="border p-4 rounded">
              <h3 className="font-semibold">Room {room.number}</h3>
              <p>Type: {room.type}</p>
              <p>Price: ${room.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
