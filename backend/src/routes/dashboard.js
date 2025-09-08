import express from 'express';
import { db } from '../firebase.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Get total rooms
    const roomsSnapshot = await db.collection('rooms').get();
    const totalRooms = roomsSnapshot.size;
    
    // Get available rooms
    const availableRooms = roomsSnapshot.docs.filter(
      doc => doc.data().status === 'available'
    ).length;
    
    // Get total bookings
    const bookingsSnapshot = await db.collection('bookings').get();
    const totalBookings = bookingsSnapshot.size;
    
    // Get active bookings (confirmed or checked-in)
    const activeBookings = bookingsSnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return status === 'confirmed' || status === 'checked-in';
    }).length;
    
    res.json({
      totalRooms,
      availableRooms,
      totalBookings,
      activeBookings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;