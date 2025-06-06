import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

let app: Express;
let cartId: string;

beforeAll(async () => {
  const { app: initializedApp } = await initApp();
  app = initializedApp;

  const cartResponse = await request(app).post("/cart").send({
    name: "Test Cart",
    ownerId: new mongoose.Types.ObjectId().toString(),
    participants: [],
    items: [],
  });
  cartId = cartResponse.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Chat test suite", () => {
  test("Add a new message to the chat", async () => {
    const response = await request(app).post(`/chat/${cartId}`).send({
      sender: "Test User",
      message: "Hello, this is a test message!",
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.sender).toBe("Test User");
    expect(response.body.message).toBe("Hello, this is a test message!");
  });

  test("Fail to add a message without required fields", async () => {
    const response = await request(app).post(`/chat/${cartId}`).send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Cart ID, sender and message are required");
  });

  test("Get messages for a cart", async () => {
    const response = await request(app).get(`/chat/${cartId}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Fail to get messages with invalid cart ID format", async () => {
    const response = await request(app).get("/chat/invalidCartId");
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Failed to fetch messages");
  });
});

describe("Additional Chat test cases", () => {
  test("Fail to add a message with missing cartId (route not found)", async () => {
    const response = await request(app).post("/chat/").send({
      sender: "Test User",
      message: "Message without cartId",
    });
    expect(response.statusCode).toBe(404);
  });

  test("Get messages for a non-existing cart", async () => {
    const nonExistingCartId = new mongoose.Types.ObjectId().toString();
    const response = await request(app).get(`/chat/${nonExistingCartId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Get messages with 'before' timestamp", async () => {
    const beforeDate = new Date().toISOString();
    const response = await request(app)
      .get(`/chat/${cartId}`)
      .query({ before: beforeDate });
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Fail to add a message with invalid cartId", async () => {
    const response = await request(app).post("/chat/invalidCartId").send({
      sender: "Test User",
      message: "Invalid cartId test",
    });
    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe("Failed to add message");
  });

  test("Fail to get messages with missing cartId (route not found)", async () => {
    const response = await request(app).get("/chat/");
    expect(response.statusCode).toBe(404);
  });
});
