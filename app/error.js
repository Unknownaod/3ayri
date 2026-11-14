"use client";
import { useEffect } from "react";

// Shown if a page crashes while rendering, instead of a blank screen.
export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeContent: "center", gap: 12, textAlign: "center", padding: 24, background: "#0d0d10", color: "#f2f2f4", font: "16px/1.5 system-ui,sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Something went wrong</h1>
      <p style={{ margin: 0, opacity: 0.75 }}>This page hit a problem. Try again, or head back home.</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button type="button" onClick={reset} style={{ padding: "10px 16px", borderRadius: 10, border: 0, background: "#e0a243", color: "#1a1204", font: "700 14px system-ui", cursor: "pointer" }}>Try again</button>
        <a href="/" style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #ffffff33", color: "inherit", textDecoration: "none", font: "600 14px system-ui" }}>Back to home</a>
      </div>
    </main>
  );
}
