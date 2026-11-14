"use client";
import { Ico } from "@/lib/icons";

// The dashboard's front page: key numbers, a "finish your page" checklist, shortcuts and a small views chart.
export function Overview({ me, go }) {
  const days = me.days || [], last7 = days.slice(-7).reduce((a, d) => a + d.v, 0), last30 = days.reduce((a, d) => a + d.v, 0);
  const clicks = Object.values(me.clicks || {}).reduce((a, b) => a + b, 0);
  const nLinks = (me.links || []).filter((l) => l.type === "link" || !l.type).length, nSocials = (me.socials || []).length;
  const max = Math.max(1, ...days.map((d) => d.v));

  const todo = [
    ["Pick a username", !!me.username, "Profile"],
    ["Upload an avatar", !!me.customAvatar, "Avatar"],
    ["Add a bio", !!(me.bio || "").trim(), "Profile"],
    ["Link your Discord account", !!me.discord?.username, "Discord"],
    ["Add socials", nSocials > 0, "Socials"],
    ["Add links", nLinks > 0, "Links"],
    ["Reach 10 profile views", (me.views || 0) >= 10, "Stats"],
  ];
  const done = todo.filter((t) => t[1]).length, pct = Math.round((done / todo.length) * 100);

  const tiles = [
    ["Username", me.username || "Not set", me.username ? "Change it any time" : "Pick one to publish your page", "user", "Profile"],
    ["Profile views", (me.views || 0).toLocaleString(), `+${last7.toLocaleString()} in the last 7 days`, "eye", "Stats"],
    ["Link clicks", clicks.toLocaleString(), `${nLinks} link${nLinks === 1 ? "" : "s"} · ${nSocials} social${nSocials === 1 ? "" : "s"}`, "link", "Links"],
    ["Last 30 days", last30.toLocaleString(), "Views this month", "chart", "Stats"],
  ];

  return (
    <div className="ov">
      <div className="ov-tiles">
        {tiles.map(([t, v, s, ic, tab]) => (
          <button type="button" className="ov-tile" key={t} onClick={() => go(tab)}>
            <span><b>{t}</b><Ico n={ic} size={18} /></span>
            <strong>{v}</strong><small>{s}</small>
          </button>
        ))}
      </div>

      <div className="ov-cols">
        <section className="ov-card">
          <h3>Profile completion</h3>
          <div className="ov-bar"><u><s style={{ width: `${pct}%` }} /></u><small>{pct}% completed</small></div>
          {done === todo.length && <div className="ov-done"><Ico n="check" size={16} /><div><b>Your profile is complete!</b><small>Explore Templates, Effects and Appearance to keep improving it.</small></div></div>}
          <div className="ov-todo">
            {todo.map(([label, ok, tab]) => (
              <button type="button" key={label} className={ok ? "ok" : ""} onClick={() => go(tab)}>
                <i>{ok && <Ico n="check" size={12} />}</i>{label}
              </button>
            ))}
          </div>
        </section>

        <div className="ov-side">
          <section className="ov-card">
            <h3>Manage your account</h3>
            <p>Change your page address, name and look.</p>
            <div className="ov-list">
              <button type="button" onClick={() => go("Profile")}><Ico n="user" size={15} />Change username</button>
              <button type="button" onClick={() => go("Profile")}><Ico n="card" size={15} />Change display name</button>
              <button type="button" onClick={() => go("Appearance")}><Ico n="palette" size={15} />Dashboard appearance</button>
              <button type="button" onClick={() => go("Settings")}><Ico n="sliders" size={15} />Account settings</button>
            </div>
          </section>
          <section className="ov-card">
            <h3>Connections</h3>
            <p>Your Discord account powers your status, name and badges.</p>
            <div className="ov-list">
              <button type="button" onClick={() => go("Discord")}><Ico n="discord" size={15} />{me.discord?.username ? `Discord connected · @${me.discord.username}` : "Connect Discord"}</button>
            </div>
          </section>
        </div>
      </div>

      <section className="ov-card">
        <div className="ov-h"><h3>Account analytics</h3><button type="button" className="hp-ghost" onClick={() => go("Stats")}>View more</button></div>
        <svg className="chart" viewBox={`0 0 ${Math.max(1, days.length) * 10} 90`} preserveAspectRatio="none" role="img" aria-label="Views per day, last 30 days">
          {days.map((d, i) => <rect key={d.d} x={i * 10 + 1} width="8" y={86 - (d.v / max) * 80} height={Math.max(1, (d.v / max) * 80)} rx="1.5"><title>{`${d.d}: ${d.v} view${d.v === 1 ? "" : "s"}`}</title></rect>)}
        </svg>
      </section>
    </div>
  );
}
