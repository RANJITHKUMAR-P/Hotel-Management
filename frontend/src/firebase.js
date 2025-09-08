import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8-F6JKON3TWznn8sbXjrZNyqmkP4Pqe4",
  authDomain: "hotel-mangagement-c9d36.firebaseapp.com",
  projectId: "hotel-mangagement-c9d36",
  storageBucket: "hotel-mangagement-c9d36.firebasestorage.app",
  messagingSenderId: "747310909768",
  appId: "1:747310909768:web:c63cfa278fb1a7c480cb7d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;