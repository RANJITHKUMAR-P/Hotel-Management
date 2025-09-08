import express from "express";
import { db } from "../firebase.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// GET /api/bookings - Get all bookings (admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const snapshot = await db.collection("bookings").get();
    
    if (snapshot.empty) {
      return res.json([]); // Return empty array instead of error
    }

    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// POST /api/bookings - Create new booking (public)
router.post("/", async (req, res) => {
  try {
    console.log("Booking request received:", req.body);
    
    const { guestName, guestEmail, guestPhone, roomId, checkIn, checkOut, numberOfGuests } = req.body;
    
    // Validation
    if (!guestName || !guestEmail || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if room exists
    const roomDoc = await db.collection("rooms").doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Room not found" });
    }

    const room = roomDoc.data();
    
    // Check if room is available
    if (room.status !== "available") {
      return res.status(400).json({ error: "Room is not available" });
    }

    // Calculate total cost
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return res.status(400).json({ error: "Check-out date must be after check-in date" });
    }

    const totalCost = nights * room.pricePerNight;

    // Generate booking ID
    const bookingId = "BKG-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const bookingData = {
      bookingId,
      guestName,
      guestEmail,
      guestPhone: guestPhone || "",
      roomId,
      roomNumber: room.roomNumber, // Store room number for easy reference
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: parseInt(numberOfGuests) || 1,
      totalCost,
      status: "confirmed",
      createdAt: new Date()
    };

    const docRef = await db.collection("bookings").add(bookingData);
    
    console.log("Booking created successfully:", docRef.id);
    
    res.status(201).json({ 
      id: docRef.id, 
      bookingId, 
      message: "Booking created successfully",
      totalCost,
      nights 
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ error: "Failed to create booking: " + error.message });
  }
});

// PUT /api/bookings/:id/checkin - Check-in booking (admin only)
router.put("/:id/checkin", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const bookingId = req.params.id;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await bookingRef.update({
      status: "checked-in",
      checkedInAt: new Date()
    });

    res.json({ message: "Booking checked in successfully" });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({ error: "Failed to check in booking" });
  }
});

// PUT /api/bookings/:id/checkout - Check-out booking (admin only)
router.put("/:id/checkout", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const bookingId = req.params.id;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await bookingRef.update({
      status: "checked-out",
      checkedOutAt: new Date()
    });

    res.json({ message: "Booking checked out successfully" });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({ error: "Failed to check out booking" });
  }
});

// DELETE /api/bookings/:id - Cancel booking (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const bookingId = req.params.id;
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await bookingRef.update({
      status: "cancelled",
      cancelledAt: new Date()
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;