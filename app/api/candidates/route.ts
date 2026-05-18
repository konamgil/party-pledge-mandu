import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";
import type { Candidate } from "@/client/shared/lib/types";

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 10) || 10));
    const offset = (page - 1) * limit;

    const rows = await db<Candidate>`SELECT "id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore" FROM "candidates" LIMIT ${limit} OFFSET ${offset}`;
    const totalRow = await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "candidates"`;

    return ctx.ok({
      data: rows,
      pagination: { page, limit, total: Number(totalRow?.total ?? rows.length) },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<Candidate>>();
    const id = body.id ?? crypto.randomUUID();

    const created = await db.one<Candidate>`
      INSERT INTO "candidates" ("id", "name", "party_id", "position", "region", "sub_region", "pledge_count", "citizen_score")
      VALUES (${id}, ${body.name ?? ""}, ${body.partyId ?? ""}, ${body.position ?? ""}, ${body.region ?? ""}, ${body.subRegion ?? ""}, ${Number(body.pledgeCount ?? 0)}, ${Number(body.citizenScore ?? 0)})
      RETURNING "id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore"
    `;
    if (!created) {
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.created({ data: created });
  });
