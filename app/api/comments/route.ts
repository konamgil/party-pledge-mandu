import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface CommentRow {
  id: string;
  pledgeId: string;
  userId: string;
  body: string;
  createdAt: string;
  userName: string;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 10) || 10));
    const offset = (page - 1) * limit;

    const pledgeIdFilter =
      typeof ctx.query?.pledgeId === "string" && ctx.query.pledgeId.length > 0
        ? ctx.query.pledgeId
        : null;

    const rows = pledgeIdFilter
      ? await db<CommentRow>`SELECT c."id", c."pledge_id" AS "pledgeId", c."user_id" AS "userId", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName" FROM "comments" c LEFT JOIN "users" u ON u."id" = c."user_id" WHERE c."pledge_id" = ${pledgeIdFilter} ORDER BY c."created_at" DESC LIMIT ${limit} OFFSET ${offset}`
      : await db<CommentRow>`SELECT c."id", c."pledge_id" AS "pledgeId", c."user_id" AS "userId", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName" FROM "comments" c LEFT JOIN "users" u ON u."id" = c."user_id" ORDER BY c."created_at" DESC LIMIT ${limit} OFFSET ${offset}`;

    const totalRow = pledgeIdFilter
      ? await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "comments" WHERE "pledge_id" = ${pledgeIdFilter}`
      : await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "comments"`;

    return ctx.ok({
      data: rows,
      pagination: { page, limit, total: Number(totalRow?.total ?? rows.length) },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<CommentRow>>();
    const now = new Date().toISOString();
    const id = body.id ?? crypto.randomUUID();

    const created = await db.one<CommentRow>`
      INSERT INTO "comments" ("id", "pledge_id", "user_id", "body", "created_at")
      VALUES (${id}, ${body.pledgeId ?? ""}, ${body.userId ?? ""}, ${body.body ?? ""}, ${body.createdAt ?? now})
      RETURNING "id", "pledge_id" AS "pledgeId", "user_id" AS "userId", "body", "created_at" AS "createdAt"
    `;
    if (!created) {
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.created({ data: created });
  });
