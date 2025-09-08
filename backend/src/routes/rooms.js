import express from "express";
import { db } from "../firebase.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/rooms - Get all rooms (public)
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("rooms").get();
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/available - Get available rooms
router.get("/available", async (req, res) => {
  try {
    const { checkin, checkout, guests } = req.query;
    
    // Basic validation
    if (!checkin || !checkout) {
      return res.status(400).json({ error: "Check-in and check-out dates are required" });
    }

    // For now, just return all available rooms
    // Later you'll add date conflict checking
    const snapshot = await db.collection("rooms")
      .where("status", "==", "available")
      .where("maxOccupancy", ">=", parseInt(guests) || 1)
      .get();
    
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(rooms);
  } catch (error) {
    console.error("Get available rooms error:", error);
    res.status(500).json({ error: "Failed to fetch available rooms" });
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
    res.json({ id: docRef.id, message: "Room added successfully" });
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

export default router;