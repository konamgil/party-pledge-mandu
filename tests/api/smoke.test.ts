import { describe, test, expect } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3335";
const PLEDGE_ID = "33333333-3333-4000-8000-000000000001";
const ADMIN_EMAIL = "admin@lamysolution.com";
const ADMIN_ID = "44444444-4444-4000-8000-000000000001";

describe("API smoke — Phase 3 routes", () => {
  test("GET /api/health", async () => {
    const r = await fetch(`${BASE}/api/health`);
    expect(r.status).toBe(200);
  });

  test.each([
    ["parties", 4],
    ["candidates", 22],
    ["pledges", 24],
  ])("GET /api/%s returns seeded count %d", async (resource, total) => {
    const r = await fetch(`${BASE}/api/${resource}?limit=100`);
    expect(r.status).toBe(200);
    const body = (await r.json()) as {
      data: unknown[];
      pagination: { total: number };
    };
    expect(body.pagination.total).toBe(total);
    expect(body.data.length).toBe(total);
  });

  test("GET /api/users returns at least seeded 2 (auto-signup may inflate)", async () => {
    const r = await fetch(`${BASE}/api/users?limit=200`);
    const body = (await r.json()) as { pagination: { total: number } };
    expect(body.pagination.total).toBeGreaterThanOrEqual(2);
  });

  test("Pledge tags deserialize to string[]", async () => {
    const r = await fetch(`${BASE}/api/pledges?limit=1`);
    const body = (await r.json()) as { data: { tags: unknown }[] };
    expect(Array.isArray(body.data[0].tags)).toBe(true);
    expect((body.data[0].tags as unknown[]).length).toBeGreaterThan(0);
  });
});

describe("Comments — Phase 6", () => {
  test("GET ?pledgeId filter + POST inserts + re-list reflects", async () => {
    const initial = (await (await fetch(`${BASE}/api/comments?pledgeId=${PLEDGE_ID}`)).json()) as {
      pagination: { total: number };
    };
    const initialTotal = initial.pagination.total;

    const post = await fetch(`${BASE}/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pledgeId: PLEDGE_ID,
        userId: ADMIN_ID,
        body: `bun test 댓글 ${Date.now()}`,
      }),
    });
    expect(post.status).toBe(201);

    const after = (await (await fetch(`${BASE}/api/comments?pledgeId=${PLEDGE_ID}`)).json()) as {
      pagination: { total: number };
      data: { body: string }[];
    };
    expect(after.pagination.total).toBe(initialTotal + 1);
    expect(after.data[0].body).toContain("bun test 댓글");
  });
});

describe("Auth — Phase 6", () => {
  test("login → me with cookie → me without cookie → logout", async () => {
    const login = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL }),
    });
    expect(login.status).toBe(200);
    const setCookie = login.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie!).toContain("mandu_session=");

    const sessionCookie = setCookie!.split(";")[0];
    const me = await fetch(`${BASE}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    expect(me.status).toBe(200);
    const meBody = (await me.json()) as { user: { email: string; name: string } | null };
    expect(meBody.user).not.toBeNull();
    expect(meBody.user!.email).toBe(ADMIN_EMAIL);
    expect(meBody.user!.name).toBe("관리자");

    const meNo = (await (await fetch(`${BASE}/api/auth/me`)).json()) as { user: unknown };
    expect(meNo.user).toBeNull();

    const logout = await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });
    expect(logout.status).toBe(200);
    const logoutCookie = logout.headers.get("set-cookie");
    expect(logoutCookie).toBeTruthy();
    expect(logoutCookie!).toContain("Max-Age=0");
  });

  test("Unknown email auto-creates user (201)", async () => {
    const randomEmail = `smoke-${Date.now()}-${Math.floor(Math.random() * 1e9)}@example.com`;
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: randomEmail, name: "스모크유저" }),
    });
    expect(r.status).toBe(201);
    const body = (await r.json()) as {
      user: { email: string; name: string } | null;
      created: boolean;
    };
    expect(body.created).toBe(true);
    expect(body.user?.email).toBe(randomEmail);
    expect(body.user?.name).toBe("스모크유저");

    // Re-login same email
    const r2 = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: randomEmail }),
    });
    expect(r2.status).toBe(200);
    const body2 = (await r2.json()) as { created: boolean };
    expect(body2.created).toBe(false);
  });

  test("Missing email returns 400", async () => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(r.status).toBe(400);
  });
});
