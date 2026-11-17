"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Re-reads the page every minute, and keeps "checked 12s ago" ticking in between.
export default function Refresh({ at }) {
  const router = useRouter();
  const [now, setNow] = useState(at);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const re = setInterval(() => router.refresh(), 60000);
    return () => { clearInterval(tick); clearInterval(re); };
  }, [router]);
  const s = Math.max(0, Math.round((now - at) / 1000));
  return <span>{s < 5 ? "just now" : s < 90 ? `${s} seconds ago` : `${Math.round(s / 60)} minutes ago`}</span>;
}
