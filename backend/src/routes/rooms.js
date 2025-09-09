import express from "express";
import { db } from "../firebase.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/rooms/available - Get available rooms
// GET /api/rooms/available - Get available rooms (updated version)
router.get("/available", async (req, res) => {
  try {
    const { checkin, checkout, guests } = req.query;
    
    if (!checkin || !checkout) {
      return res.status(400).json({ error: "Check-in and check-out dates are required" });
    }

    const checkInDate = new Date(checkin);
    const checkOutDate = new Date(checkout);
    const guestsCount = parseInt(guests) || 1;
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }
    
    if (checkInDate < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: "Check-in date cannot be in the past" });
    }
    
    // Get all available rooms first (single field query doesn't need composite index)
    const roomsSnapshot = await db.collection("rooms")
      .where("status", "==", "available")
      .get();

    // Then filter by maxOccupancy in code instead of in query
    const roomsWithCapacity = roomsSnapshot.docs.filter(doc => {
      const room = doc.data();
      return room.maxOccupancy >= guestsCount;
    });

    // Get bookings that overlap with the requested dates
    const bookingsSnapshot = await db.collection("bookings")
      .where("status", "in", ["confirmed", "checked-in"])
      .get();

    const conflictingBookings = bookingsSnapshot.docs.filter(doc => {
      const booking = doc.data();
      const bookingCheckIn = booking.checkIn.toDate();
      const bookingCheckOut = booking.checkOut.toDate();
      
      // Check for date overlap
      return (checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn);
    });

    const bookedRoomIds = conflictingBookings.map(booking => booking.data().roomId);
    
    // Filter out rooms that are booked during the requested dates
    const availableRooms = roomsWithCapacity
      .filter(doc => !bookedRoomIds.includes(doc.id))
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt
      }));

    res.json(availableRooms);
  } catch (error) {
    console.error("Get available rooms error:", error);
    res.status(500).json({ error: "Failed to fetch available rooms" });
  }
});

// GET /api/rooms - Get all rooms (admin only)
router.get("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const snapshot = await db.collection("rooms").get();
    const rooms = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt
    }));
    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id - Get specific room
router.get("/:id", async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomDoc = await db.collection("rooms").doc(roomId).get();
    
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json({ 
      id: roomDoc.id, 
      ...roomDoc.data(),
      createdAt: roomDoc.data().createdAt?.toDate() || roomDoc.data().createdAt
    });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// POST /api/rooms - Add new room (admin only)
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const { roomNumber, type, pricePerNight, maxOccupancy, amenities, status } = req.body;
    
    // Validation
    if (!roomNumber || !type || !pricePerNight || !maxOccupancy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if room number already exists
    const existingRoom = await db.collection("rooms")
      .where("roomNumber", "==", roomNumber)
      .get();
    
    if (!existingRoom.empty) {
      return res.status(400).json({ error: "Room number already exists" });
    }

    const roomData = {
      roomNumber,
      type,
      pricePerNight: Number(pricePerNight),
      maxOccupancy: Number(maxOccupancy),
      amenities: amenities || [],
      status: status || "available",
      createdAt: new Date()
    };

    const docRef = await db.collection("rooms").add(roomData);
    res.status(201).json({ id: docRef.id, message: "Room added successfully" });
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({ error: "Failed to add room" });
  }
});

// PUT /api/rooms/:id - Update room (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const roomId = req.params.id;
    const { roomNumber, type, pricePerNight, maxOccupancy, amenities, status } = req.body;

    // Check if room exists
    const roomDoc = await db.collection("rooms").doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" });
    }

    // If updating room number, check if it already exists for another room
    if (roomNumber && roomNumber !== roomDoc.data().roomNumber) {
      const existingRoom = await db.collection("rooms")
        .where("roomNumber", "==", roomNumber)
        .get();
      
      if (!existingRoom.empty) {
        return res.status(400).json({ error: "Room number already exists" });
      }
    }

    const updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (type) updateData.type = type;
    if (pricePerNight) updateData.pricePerNight = Number(pricePerNight);
    if (maxOccupancy) updateData.maxOccupancy = Number(maxOccupancy);
    if (amenities) updateData.amenities = amenities;
    if (status) updateData.status = status;

    await db.collection("rooms").doc(roomId).update(updateData);
    res.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE /api/rooms/:id - Delete room (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const roomId = req.params.id;
    
    // Check if room exists
    const roomDoc = await db.collection("rooms").doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if room has any active bookings
    const activeBookings = await db.collection("bookings")
      .where("roomId", "==", roomId)
      .where("status", "in", ["confirmed", "checked-in"])
      .get();

    if (!activeBookings.empty) {
      return res.status(400).json({ error: "Cannot delete room with active bookings" });
    }

    await db.collection("rooms").doc(roomId).delete();
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;