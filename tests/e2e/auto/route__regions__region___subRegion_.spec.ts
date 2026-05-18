import { test, expect } from "@playwright/test";


test.describe("route:/regions/[region]/[subRegion]", () => {
  test("smoke /regions/[region]/[subRegion]", async ({ page, request, baseURL }) => {
    const url = (baseURL ?? "http://127.0.0.1:3333") + "/regions/[region]/[subRegion]";
    // L0: no console.error / uncaught exception / 5xx
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(String(err)));
    await page.goto(url, { waitUntil: "networkidle" });

    expect(errors, "console/page errors").toEqual([]);
  });
});
