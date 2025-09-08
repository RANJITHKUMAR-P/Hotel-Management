import bcrypt from "bcryptjs";
import { db } from "../firebase.js";

const createAdminUser = async () => {
  try {
    const email = "admin@example.com";
    const password = "admin1234";
    
    // Check if admin already exists
    const existingUser = await db.collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    
    if (!existingUser.empty) {
      console.log("Admin user already exists");
      return;
    }
    
    // Hash password
const hashedPassword = await bcrypt.hash("admin1234", 10);

    
    // Create admin user
    const userRef = await db.collection("users").add({
      email: email,
      hashedPassword: hashedPassword,
      role: "admin",
      createdAt: new Date()
    });
    
    console.log("Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("User ID:", userRef.id);
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

// Run the script
createAdminUser();