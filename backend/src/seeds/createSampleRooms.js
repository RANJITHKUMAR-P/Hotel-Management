import { db } from "../firebase.js";

const createSampleRooms = async () => {
  const rooms = [
    {
      roomNumber: "101",
      type: "single",
      pricePerNight: 100,
      maxOccupancy: 1,
      amenities: ["WiFi", "TV"],
      status: "available",
      createdAt: new Date()
    },
    {
      roomNumber: "102",
      type: "double",
      pricePerNight: 150,
      maxOccupancy: 2,
      amenities: ["WiFi", "TV", "AC"],
      status: "available",
      createdAt: new Date()
    },
    {
      roomNumber: "201",
      type: "suite",
      pricePerNight: 250,
      maxOccupancy: 4,
      amenities: ["WiFi", "TV", "AC", "MiniBar", "Ocean View"],
      status: "available",
      createdAt: new Date()
    }
  ];

  try {
    for (const room of rooms) {
      await db.collection("rooms").add(room);
    }
    console.log("Sample rooms created successfully!");
  } catch (error) {
    console.error("Error creating sample rooms:", error);
  }
};

createSampleRooms();