import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";
import type { Pledge } from "@/client/shared/lib/types";

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readSessionUserId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === "mandu_session" && v) return decodeURIComponent(v);
  }
  return null;
}

async function loadPledgeAuthorId(pledgeId: string): Promise<string | null> {
  const row = await db.one<{ author: string }>`SELECT "author" FROM "pledges" WHERE "id" = ${pledgeId}`;
  if (!row?.author) return null;
  const user = await db.one<{ id: string }>`SELECT "id" FROM "users" WHERE "name" = ${row.author}`;
  return user?.id ?? null;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const id = typeof ctx.params?.id === "string" ? ctx.params.id : null;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const row = await db.one<Pledge & { tags: unknown }>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" WHERE "id" = ${id}`;
    if (!row) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.ok({ data: { ...row, tags: tryParseJson(row.tags) } });
  })
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
    const ownerId = await loadPledgeAuthorId(id);
    if (ownerId !== userId) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await ctx.body<Partial<Pledge> & { tags?: unknown }>();
    if (body.title !== undefined) await db`UPDATE "pledges" SET "title" = ${body.title} WHERE "id" = ${id}`;
    if (body.summary !== undefined) await db`UPDATE "pledges" SET "summary" = ${body.summary} WHERE "id" = ${id}`;
    if (body.category !== undefined) await db`UPDATE "pledges" SET "category" = ${body.category} WHERE "id" = ${id}`;
    if (body.tags !== undefined) {
      const tagsStr = typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags ?? []);
      await db`UPDATE "pledges" SET "tags" = ${tagsStr} WHERE "id" = ${id}`;
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
    const ownerId = await loadPledgeAuthorId(id);
    if (ownerId !== userId) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    await db`DELETE FROM "comments" WHERE "pledge_id" = ${id}`;
    await db`DELETE FROM "votes" WHERE "pledge_id" = ${id}`;
    await db`DELETE FROM "pledges" WHERE "id" = ${id}`;
    return ctx.ok({ data: { id, deleted: true } });
  });
