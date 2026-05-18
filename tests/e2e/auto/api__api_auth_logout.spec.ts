import { test, expect } from "@playwright/test";


test.describe("api:/api/auth/logout", () => {
  test("POST /api/auth/logout", async ({ request, baseURL }) => {
    const url = (baseURL ?? "http://127.0.0.1:3333") + "/api/auth/logout";
    const res = await fetch(url, { method: "POST" });
    expect(res.status).toBeLessThan(500);
    expect(res.headers.get("content-type")).toBeTruthy();
  });
});
