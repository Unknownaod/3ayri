import { notFound } from "next/navigation";
import { redis } from "@/lib/db";
import "../profiles.css";

async function load(username) {
  const id = await redis.get(`username:${username.toLowerCase()}`);
  return id ? redis.get(`profile:${id}`) : null;
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const p = await load(username);
  return p ? { title: `${p.displayName} (@${p.username}) · Haven`, description: p.bio } : {};
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const p = await load(username);
  if (!p) notFound();

  return (
    <main className="hp-page" style={{ "--accent": p.accent }}>
      <article className="hp-card">
        {p.avatar && <img className="hp-avatar" src={p.avatar} alt="" width={112} height={112} />}
        <h1>{p.displayName}</h1>
        <p className="hp-handle">@{p.username}</p>
        {p.bio && <p className="hp-bio">{p.bio}</p>}
        <ul className="hp-links">
          {p.links.map((l) => (
            <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer nofollow">{l.label}</a></li>
          ))}
        </ul>
      </article>
      <a className="hp-foot" href="/">havenshq.xyz</a>
    </main>
  );
}
