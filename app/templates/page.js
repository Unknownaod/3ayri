import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import { TemplatesPage } from "../dashboard/Templates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Templates · Haven", description: "Start your page from a look someone else made." };

export default async function Page() {
  let user = null;
  try {
    const id = await getSessionId();
    const p = id && (await redis.get(`profile:${id}`));
    if (p) user = { name: p.name || p.displayName || p.username || "You", username: p.username || "", avatar: (p.customAvatar && !p.customAvatar.startsWith("data:") ? p.customAvatar : p.avatar) || "" };
  } catch {}
  return <TemplatesPage user={user} invite={process.env.DISCORD_INVITE} />;
}
