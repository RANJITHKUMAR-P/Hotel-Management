import request from "supertest";
import app from "../src/index.js";
import { db } from "../src/firebase.js";

describe("Authentication API", () => {
  afterAll(async () => {
    //  Close Firestore when tests are done to avoid open handles
    await db.terminate();
  });

  test("POST /api/auth/login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "admin1234", //  must match your seed/admin creation
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toMatchObject({
      email: "admin@example.com",
      role: "admin",
    });
  });

  test("POST /api/auth/login with invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });
});
