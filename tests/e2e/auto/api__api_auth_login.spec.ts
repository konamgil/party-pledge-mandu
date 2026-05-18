import { test, expect } from "@playwright/test";


test.describe("api:/api/auth/login", () => {
  test("POST /api/auth/login", async ({ request, baseURL }) => {
    const url = (baseURL ?? "http://127.0.0.1:3333") + "/api/auth/login";
    const res = await fetch(url, { method: "POST" });
    expect(res.status).toBeLessThan(500);
    expect(res.headers.get("content-type")).toBeTruthy();
  });
});
