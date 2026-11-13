import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Invoice API", () => {
  const app = createApp();

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });

  it("creates an invoice", async () => {
    const response = await request(app)
      .post("/api/invoices")
      .send({ amount: 40000 });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(40000);
    expect(response.body.status).toBe("PENDING");
    expect(response.body.approvals).toHaveLength(0);
  });

  it("rejects an invalid invoice amount", async () => {
    const response = await request(app)
      .post("/api/invoices")
      .send({ amount: -100 });

    expect(response.status).toBe(400);
  });

  it("retrieves an existing invoice", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 40000 });

    const response = await request(app).get(`/api/invoices/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created.body.id);
  });

  it("returns 404 for an unknown invoice", async () => {
    const response = await request(app).get("/api/invoices/unknown-id");

    expect(response.status).toBe(404);
  });

  it("records the authenticated Director name, role, and approval time", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 200000 });

    const response = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer director-token");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("APPROVED");
    expect(response.body.approvals[0]).toMatchObject({
      approverId: "director-1",
      approverName: "Director One",
      approverRole: "DIRECTOR",
    });
    expect(Date.parse(response.body.approvals[0].approvedAt)).not.toBeNaN();
  });

  it.each([
    ["missing", undefined],
    ["invalid", "Bearer invalid-token"],
  ])(
    "rejects a request with %s authentication without mutating its invoice",
    async (_authenticationType, authorizationHeader) => {
      const created = await request(app)
        .post("/api/invoices")
        .send({ amount: 50000 });
      const before = await request(app).get(`/api/invoices/${created.body.id}`);

      let approvalRequest = request(app).post(
        `/api/invoices/${created.body.id}/approve`,
      );
      if (authorizationHeader) {
        approvalRequest = approvalRequest.set(
          "Authorization",
          authorizationHeader,
        );
      }

      const response = await approvalRequest;
      const after = await request(app).get(`/api/invoices/${created.body.id}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(
        /authentication|required|invalid token/i,
      );
      expect(after.body).toEqual(before.body);
    },
  );

  it("uses the authenticated Manager role instead of a role claimed in the body", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 50001 });
    const before = await request(app).get(`/api/invoices/${created.body.id}`);

    const response = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer manager-token")
      .send({
        role: "DIRECTOR",
        userId: "director-1",
        name: "Director One",
      });
    const after = await request(app).get(`/api/invoices/${created.body.id}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "You are not authorized to approve this invoice.",
    );
    expect(after.body).toEqual(before.body);
  });

  it("does not accept another user's identity from the body for a successful approval", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 600000 });

    const response = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer manager-token")
      .send({
        role: "DIRECTOR",
        userId: "director-1",
        name: "Director One",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("PENDING");
    expect(response.body.approvals[0]).toMatchObject({
      approverId: "manager-1",
      approverName: "Manager One",
      approverRole: "MANAGER",
    });
  });

  it("rejects approval of an already approved invoice without changing history", async () => {
    const created = await request(app)
      .post("/api/invoices")
      .send({ amount: 50000 });
    const firstApproval = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer manager-token");
    const before = await request(app).get(`/api/invoices/${created.body.id}`);

    const response = await request(app)
      .post(`/api/invoices/${created.body.id}/approve`)
      .set("Authorization", "Bearer director-token");
    const after = await request(app).get(`/api/invoices/${created.body.id}`);

    expect(firstApproval.status).toBe(200);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Only pending invoices can be approved.");
    expect(after.body).toEqual(before.body);
  });
});
