import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface CommentRow {
  id: string;
  pledgeId: string;
  userId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  userName: string;
}

const SELECT_COLS = `c."id", c."pledge_id" AS "pledgeId", c."user_id" AS "userId", c."parent_id" AS "parentId", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName"`;

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(200, Math.max(1, Number(ctx.query?.limit ?? 50) || 50));
    const offset = (page - 1) * limit;
    const pledgeIdFilter =
      typeof ctx.query?.pledgeId === "string" && ctx.query.pledgeId.length > 0
        ? ctx.query.pledgeId
        : null;

    const rows = pledgeIdFilter
      ? await db<CommentRow>`SELECT c."id", c."pledge_id" AS "pledgeId", c."user_id" AS "userId", c."parent_id" AS "parentId", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName" FROM "comments" c LEFT JOIN "users" u ON u."id" = c."user_id" WHERE c."pledge_id" = ${pledgeIdFilter} ORDER BY c."created_at" ASC LIMIT ${limit} OFFSET ${offset}`
      : await db<CommentRow>`SELECT c."id", c."pledge_id" AS "pledgeId", c."user_id" AS "userId", c."parent_id" AS "parentId", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName" FROM "comments" c LEFT JOIN "users" u ON u."id" = c."user_id" ORDER BY c."created_at" DESC LIMIT ${limit} OFFSET ${offset}`;

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
    const parentId = body.parentId ?? null;

    await db`INSERT INTO "comments" ("id", "pledge_id", "user_id", "parent_id", "body", "created_at") VALUES (${id}, ${body.pledgeId ?? ""}, ${body.userId ?? ""}, ${parentId}, ${body.body ?? ""}, ${now})`;

    // 알림 자동 생성: 답글이면 parent 작성자에게 / 일반 댓글이면 공약 작성자에게
    try {
      if (parentId) {
        const parent = await db.one<{ userId: string }>`SELECT "user_id" AS "userId" FROM "comments" WHERE "id" = ${parentId}`;
        if (parent && parent.userId !== body.userId) {
          await db`INSERT INTO "notifications" ("id", "user_id", "type", "title", "body", "pledge_id", "comment_id", "from_user_id", "is_read", "created_at") VALUES (${crypto.randomUUID()}, ${parent.userId}, ${"reply"}, ${"내 댓글에 답글이 달렸어요"}, ${(body.body ?? "").slice(0, 100)}, ${body.pledgeId ?? null}, ${id}, ${body.userId ?? null}, 0, ${now})`;
        }
      } else if (body.pledgeId) {
        const pledge = await db.one<{ author: string; title: string }>`SELECT "author", "title" FROM "pledges" WHERE "id" = ${body.pledgeId}`;
        const author = await db.one<{ id: string }>`SELECT "id" FROM "users" WHERE "name" = ${pledge?.author ?? ""}`;
        if (author && author.id !== body.userId) {
          await db`INSERT INTO "notifications" ("id", "user_id", "type", "title", "body", "pledge_id", "comment_id", "from_user_id", "is_read", "created_at") VALUES (${crypto.randomUUID()}, ${author.id}, ${"comment"}, ${"내 공약에 새 댓글"}, ${(body.body ?? "").slice(0, 100)}, ${body.pledgeId}, ${id}, ${body.userId ?? null}, 0, ${now})`;
        }
      }
    } catch {
      // 알림 실패는 댓글 작성에 영향 없음
    }

    return ctx.created({
      data: { id, pledgeId: body.pledgeId, userId: body.userId, parentId, body: body.body, createdAt: now },
    });
  });
