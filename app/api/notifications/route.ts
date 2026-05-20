import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface NotificationRow {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  pledgeId: string | null;
  commentId: string | null;
  fromUserId: string | null;
  isRead: number; // SQLite boolean = integer
  createdAt: string;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const userIdFilter =
      typeof ctx.query?.userId === "string" && ctx.query.userId.length > 0
        ? ctx.query.userId
        : null;
    if (!userIdFilter) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 30) || 30));
    const rows = await db<NotificationRow>`SELECT "id", "user_id" AS "userId", "type", "title", "body", "pledge_id" AS "pledgeId", "comment_id" AS "commentId", "from_user_id" AS "fromUserId", "is_read" AS "isRead", "created_at" AS "createdAt" FROM "notifications" WHERE "user_id" = ${userIdFilter} ORDER BY "created_at" DESC LIMIT ${limit}`;
    const unread = await db.one<{ unread: number }>`SELECT COUNT(*) AS "unread" FROM "notifications" WHERE "user_id" = ${userIdFilter} AND ("is_read" IS NULL OR "is_read" = 0)`;
    return ctx.ok({
      data: rows.map((r) => ({ ...r, isRead: !!r.isRead })),
      unread: Number(unread?.unread ?? 0),
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<NotificationRow>>();
    if (!body.userId || !body.type || !body.title) {
      return new Response(JSON.stringify({ error: "userId, type, title required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const id = body.id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    await db`INSERT INTO "notifications" ("id", "user_id", "type", "title", "body", "pledge_id", "comment_id", "from_user_id", "is_read", "created_at") VALUES (${id}, ${body.userId}, ${body.type}, ${body.title}, ${body.body ?? ""}, ${body.pledgeId ?? null}, ${body.commentId ?? null}, ${body.fromUserId ?? null}, 0, ${now})`;
    return ctx.created({
      data: { id, userId: body.userId, type: body.type, title: body.title, body: body.body, isRead: false, createdAt: now },
    });
  });
