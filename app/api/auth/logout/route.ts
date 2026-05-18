import { Mandu } from "@mandujs/core";

export default Mandu.filling().post(() => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "mandu_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
});
