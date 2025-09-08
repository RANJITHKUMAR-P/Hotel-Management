

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// import authRoutes from "./routes/auth.js";
// import roomRoutes from "./routes/rooms.js";
// import bookingRoutes from "./routes/bookings.js";

// // Load environment variables
// dotenv.config();
// console.log("Loaded JWT_SECRET:", JSON.stringify(process.env.JWT_SECRET));
// console.log("Environment variables check:");
// console.log("PORT:", process.env.PORT);
// console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
// console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);

// const app = express();

// // ✅ FIXED: Allow both frontend ports for development
// app.use(cors({
//   origin: ["http://localhost:3000", "http://localhost:5173"],
//   credentials: true
// }));

// app.use(express.json());

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
//   next();
// });

// app.get("/", (req, res) => {
//   res.json({ message: "Backend API is working 🚀" });
// });

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/rooms", roomRoutes);
// app.use("/api/bookings", bookingRoutes);

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({ 
//     status: "OK", 
//     message: "Server is running",
//     timestamp: new Date().toISOString()
//   });
// });

// // Simple 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: "Route not found" });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error("Server error:", err);
//   res.status(500).json({ error: "Internal server error" });
// });

// // ✅ FIXED: Use port 5000 (or from env) instead of 5173
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} 🚀`);
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import bookingRoutes from "./routes/bookings.js";
import dashboardRoutes from "./routes/dashboard.js";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Backend API is working 🚀" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Simple 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});