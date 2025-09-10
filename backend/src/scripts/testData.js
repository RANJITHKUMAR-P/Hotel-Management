import { db } from '../firebase.js';

export const createTestData = async () => {
  // Create test rooms
  const rooms = [
    {
      roomNumber: '101',
      type: 'single',
      pricePerNight: 100,
      maxOccupancy: 1,
      amenities: ['WiFi', 'TV'],
      status: 'available'
    },
    {
      roomNumber: '102',
      type: 'double',
      pricePerNight: 150,
      maxOccupancy: 2,
      amenities: ['WiFi', 'TV', 'AC'],
      status: 'available'
    }
  ];

  for (const room of rooms) {
    await db.collection('rooms').add({
      ...room,
      createdAt: new Date()
    });
  }

  console.log('Test data created successfully');
};