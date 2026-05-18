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

function deserializeTags<T extends { tags: unknown }>(row: T): T {
  return { ...row, tags: tryParseJson(row.tags) } as T;
}

export default Mandu.filling()
  .get(async (ctx) => {
    const page = Math.max(1, Number(ctx.query?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(ctx.query?.limit ?? 10) || 10));
    const offset = (page - 1) * limit;

    const rows = await db<Pledge & { tags: unknown }>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" LIMIT ${limit} OFFSET ${offset}`;
    const totalRow = await db.one<{ total: number }>`SELECT COUNT(*) AS "total" FROM "pledges"`;

    return ctx.ok({
      data: rows.map(deserializeTags),
      pagination: {
        page,
        limit,
        total: Number(totalRow?.total ?? rows.length),
      },
    });
  })
  .post(async (ctx) => {
    const body = await ctx.body<Partial<Pledge> & { tags?: unknown }>();
    const now = new Date().toISOString();
    const id = body.id ?? crypto.randomUUID();
    const tagsStr =
      typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags ?? []);

    const created = await db.one<Pledge & { tags: unknown }>`
      INSERT INTO "pledges" ("id", "party_id", "candidate_id", "candidate_name", "candidate_position", "title", "summary", "category", "region", "sub_region", "position_tab", "upvotes", "downvotes", "comment_count", "author", "tags", "created_at")
      VALUES (${id}, ${body.partyId ?? ""}, ${body.candidateId ?? ""}, ${body.candidateName ?? ""}, ${body.candidatePosition ?? ""}, ${body.title ?? ""}, ${body.summary ?? ""}, ${body.category ?? ""}, ${body.region ?? ""}, ${body.subRegion ?? ""}, ${body.positionTab ?? ""}, ${Number(body.upvotes ?? 0)}, ${Number(body.downvotes ?? 0)}, ${Number(body.commentCount ?? 0)}, ${body.author ?? ""}, ${tagsStr}, ${body.createdAt ?? now})
      RETURNING "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt"
    `;
    if (!created) {
      return new Response(JSON.stringify({ error: "insert failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return ctx.created({ data: deserializeTags(created) });
  });
