import { NextResponse } from "next/server";

export function GET(req) {
  const origin = new URL(req.url).origin;
  const p = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: `${process.env.SITE_URL}api/auth/callback`,
    response_type: "code",
    scope: "identify",
  });
  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${p}`);
}
