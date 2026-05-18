import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface VoteRow {
  id: string;
  userId: string;
  pledgeId: string;
  direction: number;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(200, Math.max(1, Number(ctx.query?.limit ?? 100) || 100));
    const offset = (page - 1) * limit;
    const userIdFilter =
      typeof ctx.query?.userId === "string" && ctx.query.userId.length > 0
        ? ctx.query.userId
        : null;

    const rows = userIdFilter
      ? await db<VoteRow>`SELECT "id", "user_id" AS "userId", "pledge_id" AS "pledgeId", "direction" FROM "votes" WHERE "user_id" = ${userIdFilter} LIMIT ${limit} OFFSET ${offset}`
      : await db<VoteRow>`SELECT "id", "user_id" AS "userId", "pledge_id" AS "pledgeId", "direction" FROM "votes" LIMIT ${limit} OFFSET ${offset}`;

    const totalRow = userIdFilter
      ? await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "votes" WHERE "user_id" = ${userIdFilter}`
      : await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "votes"`;

    return ctx.ok({
      data: rows,
      pagination: { page, limit, total: Number(totalRow?.total ?? rows.length) },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<{ userId?: string; pledgeId?: string; direction?: number }>();
    const userId = body.userId?.trim();
    const pledgeId = body.pledgeId?.trim();
    const direction = Number(body.direction ?? 0);

    if (!userId || !pledgeId) {
      return new Response(JSON.stringify({ error: "userId and pledgeId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (direction !== 0 && direction !== 1 && direction !== -1) {
      return new Response(JSON.stringify({ error: "direction must be -1, 0, or 1" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // direction = 0 → toggle off
    if (direction === 0) {
      await db`DELETE FROM "votes" WHERE "user_id" = ${userId} AND "pledge_id" = ${pledgeId}`;
      return ctx.ok({ data: { userId, pledgeId, direction: 0 } });
    }

    // upsert: SELECT then UPDATE/INSERT
    const existing = await db.one<{ id: string }>`SELECT "id" FROM "votes" WHERE "user_id" = ${userId} AND "pledge_id" = ${pledgeId} LIMIT 1`;
    if (existing) {
      await db`UPDATE "votes" SET "direction" = ${direction} WHERE "id" = ${existing.id}`;
      return ctx.ok({ data: { id: existing.id, userId, pledgeId, direction } });
    }

    const id = crypto.randomUUID();
    await db`INSERT INTO "votes" ("id", "user_id", "pledge_id", "direction") VALUES (${id}, ${userId}, ${pledgeId}, ${direction})`;
    return ctx.created({ data: { id, userId, pledgeId, direction } });
  });
