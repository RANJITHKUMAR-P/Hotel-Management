import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { db } from "../firebase.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", [
  // Remove Authorization header for login requests
  (req, res, next) => {
    delete req.headers.authorization;
    next();
  },
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 1 }),
], async (req, res) => {
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);

    // Read JWT_SECRET from environment variables
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log("JWT_SECRET exists:", !!JWT_SECRET);
    
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing!");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ error: "Invalid email or password format" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    const searchEmail = email.toLowerCase().trim();
    console.log("Searching for email:", searchEmail);

    // Query Firestore for user
    const userSnap = await db
      .collection("users")
      .where("email", "==", searchEmail)
      .limit(1)
      .get();

    console.log("Firestore query completed. Found documents:", userSnap.size);

    if (userSnap.empty) {
      console.log("❌ No user found with email:", searchEmail);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    console.log("✅ User found in database:");
    console.log("   Document ID:", userId);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);

    // Check if user has password
    if (!user.hashedPassword) {
      console.error("❌ User has no password set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Compare passwords
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password does not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    console.log("✅ Password matched! Creating JWT token...");
    const token = jwt.sign(
      {
        uid: userId,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET, // Use the variable here
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    console.log("🎉 Login successful for:", user.email);
    
    res.json({
      token,
      user: {
        uid: userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during authentication" });
  }
});

export default router;