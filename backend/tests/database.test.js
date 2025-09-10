import { db } from "../src/firebase.js";

describe("Database Operations", () => {
  afterAll(async () => {
    //  Close Firestore cleanly after all tests
    await db.terminate();
  });

  test("should create a room document", async () => {
    const roomData = {
      roomNumber: "101",
      type: "single",
      pricePerNight: 100,
      maxOccupancy: 1,
      amenities: ["WiFi", "TV"],
      status: "available",
      createdAt: new Date()
    };

    const docRef = await db.collection("rooms").add(roomData);
    const doc = await docRef.get();

    expect(doc.exists).toBe(true);
    expect(doc.data().roomNumber).toBe("101");
  });

  test("should prevent duplicate room numbers", async () => {
    // TODO: Implement your own logic to check duplicates
    // Firestore does not enforce uniqueness itself
    expect(true).toBe(true);
  });
});
