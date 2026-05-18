import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface UserRow {
  id: string;
  email: string;
  name: string;
}

function readSessionUserId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === "mandu_session" && v) return decodeURIComponent(v);
  }
  return null;
}

export default Mandu.filling().get(async (ctx) => {
  const userId = readSessionUserId(ctx.headers.get("cookie"));
  if (!userId) return ctx.ok({ user: null });

  const user = await db.one<UserRow>`SELECT "id", "email", "name" FROM "users" WHERE "id" = ${userId}`;
  return ctx.ok({ user: user ?? null });
});
