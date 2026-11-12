import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Invoice API", () => {
  const app = createApp();

  it("should return health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });

  it("should create an invoice", async () => {
    const response = await request(app)
      .post("/api/invoices")
      .send({ amount: 40000 });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(40000);
    expect(response.body.status).toBe("PENDING");
    expect(response.body.approvals).toHaveLength(0);
  });

  it("should reject an invalid invoice amount", async () => {
    const response = await request(app)
      .post("/api/invoices")
      .send({ amount: -100 });

    expect(response.status).toBe(400);
  });

  it("should retrieve an existing invoice", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 40000 });

    const response = await request(app).get(`/api/invoices/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created.body.id);
  });

  it("should return 404 for an unknown invoice", async () => {
    const response = await request(app).get("/api/invoices/unknown-id");

    expect(response.status).toBe(404);
  });

  it("should allow an authenticated Director to approve an invoice", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 200000 });

    const response = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer director-token");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("APPROVED");
  });
});
