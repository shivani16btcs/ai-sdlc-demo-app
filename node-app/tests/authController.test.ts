
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Authentication API", () => {
  const app = createApp();

  it("logs in a Manager", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        username: "manager",
        password: "manager123"
      });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("MANAGER");
    expect(response.body.token).toBe("manager-token");
  });

  it("logs in a Director", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        username: "director",
        password: "director123"
      });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("DIRECTOR");
  });

  it("rejects invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        username: "manager",
        password: "wrong-password"
      });

    expect(response.status).toBe(401);
  });
});
