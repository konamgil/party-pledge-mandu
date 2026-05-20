import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

export default Mandu.filling()
  .patch(async (ctx) => {
    const id = typeof ctx.params?.id === "string" ? ctx.params.id : null;
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await ctx.body<{ isRead?: boolean }>();
    if (typeof body.isRead === "boolean") {
      await db`UPDATE "notifications" SET "is_read" = ${body.isRead ? 1 : 0} WHERE "id" = ${id}`;
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
    await db`DELETE FROM "notifications" WHERE "id" = ${id}`;
    return ctx.ok({ data: { id } });
  });
