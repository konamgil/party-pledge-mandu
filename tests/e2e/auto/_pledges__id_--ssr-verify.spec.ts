import { test, expect } from "@playwright/test";


test.describe("/pledges/[id]--ssr-verify", () => {
  test("ssr-verify /pledges/[id]", async ({ page, baseURL }) => {
    const url = (baseURL ?? "http://127.0.0.1:3333") + "/pledges/[id]";
    const res = await page.goto(url, { waitUntil: "networkidle" });
    expect(res, "goto response").not.toBeNull();
    expect(res!.status()).toBeLessThan(500);
    const html = await page.content();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    // Body cannot be empty — a near-empty SSR response is almost always a bug.
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyInner = (bodyMatch?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    expect(bodyInner.length, "body content should not be empty").toBeGreaterThan(0);
    // Semantic anchor — Mandu emits [data-route-id] on the outermost wrapper,
    // or the page uses <main>. Either is sufficient evidence that a real page rendered.
    const hasRouteAnchor = /data-route-id=/.test(html);
    const hasMainLandmark = /<main[\s>]/.test(html);
    expect(hasRouteAnchor || hasMainLandmark, "expected [data-route-id] or <main> landmark in SSR output").toBe(true);
    expect(html).not.toContain("data-mandu-island");
  });
});
