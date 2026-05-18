import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface UserRow {
  id: string;
  email: string;
  name: string;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 10) || 10));
    const offset = (page - 1) * limit;

    const rows = await db<UserRow>`SELECT "id", "email", "name" FROM "users" LIMIT ${limit} OFFSET ${offset}`;
    const totalRow = await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "users"`;

    return ctx.ok({
      data: rows,
      pagination: { page, limit, total: Number(totalRow?.total ?? rows.length) },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<UserRow>>();
    const id = body.id ?? crypto.randomUUID();

    const created = await db.one<UserRow>`
      INSERT INTO "users" ("id", "email", "name")
      VALUES (${id}, ${body.email ?? ""}, ${body.name ?? ""})
      RETURNING "id", "email", "name"
    `;
    if (!created) {
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.created({ data: created });
  });
