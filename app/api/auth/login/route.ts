import { Mandu } from "@mandujs/core";
import { db } from "@/server/infra/db";

interface UserRow {
  id: string;
  email: string;
  name: string;
}

export default Mandu.filling().post(async (ctx) => {
  const body = await ctx.body<{ email?: string; name?: string }>();
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return new Response(JSON.stringify({ error: "email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let user = await db.one<UserRow>`SELECT "id", "email", "name" FROM "users" WHERE LOWER("email") = ${email}`;

  let created = false;
  if (!user) {
    const desiredName = body.name?.trim();
    const fallbackName = email.includes("@") ? email.split("@")[0] : email;
    const name = desiredName && desiredName.length > 0 ? desiredName : fallbackName;
    const id = crypto.randomUUID();
    await db`INSERT INTO "users" ("id", "email", "name") VALUES (${id}, ${email}, ${name})`;
    user = { id, email, name };
    created = true;
  }

  return new Response(JSON.stringify({ user, created }), {
    status: created ? 201 : 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `mandu_session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
    },
  });
});
