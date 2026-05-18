import { test, expect } from "@playwright/test";


test.describe("api:/api/auth/me", () => {
  test("GET /api/auth/me", async ({ request, baseURL }) => {
    const url = (baseURL ?? "http://127.0.0.1:3333") + "/api/auth/me";
    const res = await fetch(url, { method: "GET" });
    expect(res.status).toBeLessThan(500);
    expect(res.headers.get("content-type")).toBeTruthy();
    const body = await res.text();
    expect(body.length).toBeGreaterThan(0);
  });
});
