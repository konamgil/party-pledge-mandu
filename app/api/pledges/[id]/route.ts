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

export default Mandu.filling().get(async (ctx) => {
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
});
