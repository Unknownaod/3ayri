import { redirect } from "next/navigation";
import { getSessionId } from "@/lib/session";
import { redis } from "@/lib/db";
import Dashboard from "../Dashboard";

export const dynamic = "force-dynamic";

// /dashboard/<your username> (or /dashboard/me until you've picked one). Anyone else's name sends you to your own.
export default async function Page({ params }) {
  const id = await getSessionId();
  if (!id) redirect("/dashboard");
  const p = await redis.get(`profile:${id}`);
  if (!p) redirect("/dashboard");
  const want = p.username || "me";
  if (String((await params).username).toLowerCase() !== want.toLowerCase()) redirect(`/dashboard/${want}`);
  return <Dashboard />;
}
