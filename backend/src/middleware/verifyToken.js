import jwt from "jsonwebtoken";
import { db } from "../firebase.js";

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Read JWT_SECRET from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Check if token is revoked
    const revokedDoc = await db.collection("revokedTokens").doc(token).get();
    if (revokedDoc.exists) {
      return res.status(401).json({ error: "Token revoked. Please login again." });
    }

    // Verify token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Get complete user data from Firestore
    const userSnap = await db.collection("users")
      .where("email", "==", payload.email)
      .limit(1)
      .get();
      
    if (userSnap.empty) {
      return res.status(401).json({ error: "User not found" });
    }
    
    const userData = userSnap.docs[0].data();
    
    // Attach complete user info to request
    req.user = { 
      uid: userSnap.docs[0].id, 
      email: userData.email, 
      role: userData.role 
    };
    req.token = token;
    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    return res.status(500).json({ error: "Authentication error" });
  }
}