import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";
import type { Party } from "@/client/shared/lib/types";

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 10) || 10));
    const offset = (page - 1) * limit;

    const rows = await db<Party>`SELECT "id", "code", "name", "short_name" AS "shortName", "initial", "color", "logo_url" AS "logoUrl" FROM "parties" LIMIT ${limit} OFFSET ${offset}`;
    const totalRow = await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "parties"`;

    return ctx.ok({
      data: rows,
      pagination: { page, limit, total: Number(totalRow?.total ?? rows.length) },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<Party>>();
    const id = body.id ?? crypto.randomUUID();

    const created = await db.one<Party>`
      INSERT INTO "parties" ("id", "code", "name", "short_name", "initial", "color", "logo_url")
      VALUES (${id}, ${body.code ?? ""}, ${body.name ?? ""}, ${body.shortName ?? ""}, ${body.initial ?? ""}, ${body.color ?? ""}, ${body.logoUrl ?? ""})
      RETURNING "id", "code", "name", "short_name" AS "shortName", "initial", "color", "logo_url" AS "logoUrl"
    `;
    if (!created) {
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.created({ data: created });
  });
