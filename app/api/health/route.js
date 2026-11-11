import { NextResponse } from "next/server";

export async function GET() {
  const out = {};
  for (const k of ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_REDIRECT_URI", "SESSION_SECRET", "MONGODB_URI"]) {
    out[k] = process.env[k] ? "set" : "MISSING";
  }
  out.redirectUriValue = process.env.DISCORD_REDIRECT_URI || null;

  try {
    const { MongoClient } = await import("mongodb");
    const c = await new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect();
    await c.db("haven").command({ ping: 1 });
    await c.close();
    out.mongo = "connected";
  } catch (e) {
    out.mongo = `FAILED: ${e.message}`;
  }

  return NextResponse.json(out, { status: 200 });
}
