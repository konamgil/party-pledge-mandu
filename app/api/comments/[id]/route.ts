import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

function readSessionUserId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === "mandu_session" && v) return decodeURIComponent(v);
  }
  return null;
}

export default Mandu.filling()
  .patch(async (ctx) => {
    const id = typeof ctx.params?.id === "string" ? ctx.params.id : null;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = readSessionUserId(ctx.headers.get("cookie"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const row = await db.one<{ userId: string }>`SELECT "user_id" AS "userId" FROM "comments" WHERE "id" = ${id}`;
    if (!row) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (row.userId !== userId) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await ctx.body<{ body?: string }>();
    if (typeof body.body === "string") {
      await db`UPDATE "comments" SET "body" = ${body.body} WHERE "id" = ${id}`;
    }
    return ctx.ok({ data: { id } });
  })
  .delete(async (ctx) => {
    const id = typeof ctx.params?.id === "string" ? ctx.params.id : null;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = readSessionUserId(ctx.headers.get("cookie"));
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const row = await db.one<{ userId: string }>`SELECT "user_id" AS "userId" FROM "comments" WHERE "id" = ${id}`;
    if (!row) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (row.userId !== userId) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    // 답글도 함께 삭제
    await db`DELETE FROM "comments" WHERE "parent_id" = ${id}`;
    await db`DELETE FROM "comments" WHERE "id" = ${id}`;
    return ctx.ok({ data: { id, deleted: true } });
  });
