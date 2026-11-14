import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import Landing from "./Landing";

export const dynamic = "force-dynamic";

// Landing page for everyone. Signed-in people get their avatar and name in the top bar, with a button to open the dashboard.
export default async function Page() {
  let user = null;
  try {
    const id = await getSessionId();
    const p = id && (await redis.get(`profile:${id}`));
    if (p) {
      const img = p.customAvatar && !p.customAvatar.startsWith("data:") ? p.customAvatar : p.avatar;
      user = { name: p.name || p.displayName || p.username || "You", username: p.username || "", avatar: img || "" };
    }
  } catch {}
  return <Landing user={user} invite={process.env.DISCORD_INVITE} />;
}
