// Discord public_flags bit -> [bit, label, glyph, color, art id, Discord badge-icon hash]. badgesOf() -> [label, glyph, color, art id, hash]
export const badgeUrl = (hash) => `https://cdn.discordapp.com/badge-icons/${hash}.png`;
export const BADGES = [[1, "Discord Staff", "🛡️", "#5865f2", "staff", "5e74e9b61934fc1f67c65515d1f7e60d"], [2, "Partnered Server Owner", "🤝", "#5865f2", "partner", "3f9748e53446a137a052f3454e2de41e"], [4, "HypeSquad Events", "🎉", "#f9a21c", "events", "bf01d1073931f921909045f3a39fd264"], [8, "Bug Hunter", "🐛", "#3ba55d", "bug", "2717692c7dca7289b35297368a940dd0"],
  [64, "HypeSquad Bravery", "🟣", "#9c84ef", "bravery", "8a88d63823d8a71cd5e390baa45efa02"], [128, "HypeSquad Brilliance", "🟠", "#f47b67", "brilliance", "011940fd013da3f7fb926e4a1cd2e618"], [256, "HypeSquad Balance", "🟢", "#45ddc0", "balance", "3aa41de486fa12454c3761e8e223442e"], [512, "Early Supporter", "🌅", "#7289da", "early", "7060786766c9c840eb3019e725d2b358"],
  [16384, "Bug Hunter Gold", "🐞", "#f2b01e", "buggold", "848f79194d4be5ff5f81505cbd0ce1e6"], [131072, "Early Verified Bot Developer", "🤖", "#5865f2", "botdev", "6df5892e0f35b051f8b61eace34f4967"], [262144, "Certified Moderator", "⚖️", "#3ba55d", "mod", "fee1624003e2fee35cb398e125dc479b"], [4194304, "Active Developer", "⚡", "#3ba55d", "dev", "6bdc42827a38498929a4920da12695d9"]];
// Badges Discord's API doesn't report for other people (boosting, Nitro tenure, quests, legacy username).
// The page owner turns these on by hand in the dashboard. [id, label, glyph, color, badge-icon hash]
export const EXTRA = [
  ["nitro", "Nitro", "💎", "#ff73fa", "2ba85e8026a8614b640c2837bcdfe21b"],
  ["booster", "Server Booster", "🚀", "#ff73fa", "51040c70d4f20a921ad6674ff86fc95c"],
  ["legacy", "Originally known as", "🏷️", "#5865f2", "6de6d34650760ba5551a79732e98ed60"],
  ["quest", "Completed a Quest", "🧭", "#5865f2", "7d9ae358c8c5e118768335dbe68b4fb8"],
  ["bronze", "Nitro: Bronze", "🥉", "#cd7f32", "4f33c4a9c64ce221936bd256c356f91f"],
  ["silver", "Nitro: Silver", "🥈", "#c0c0c0", "4514fab914bdbfb4ad2fa23df76121a6"],
  ["gold", "Nitro: Gold", "🥇", "#ffd700", "2895086c18d5531d499862e41d1155a6"],
  ["platinum", "Nitro: Platinum", "🔷", "#7fd1e8", "0334688279c8359120922938dcb1d6f8"],
  ["diamond", "Nitro: Diamond", "💠", "#8fb8ff", "0d61871f72bb9a33a7ae568c1fb4f20a"],
  ["emerald", "Nitro: Emerald", "🟩", "#2ecc71", "11e2d339068b55d3a506cff34d3780f3"],
  ["ruby", "Nitro: Ruby", "♦️", "#e0245e", "cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4"],
  ["opal", "Nitro: Opal", "🔮", "#b69cff", "5b154df19c53dce2af92c9b61e6be5e2"],
];
// Everything an owner can pick by hand: the 12 Discord flags plus the extras above.
export const PICKABLE = [...BADGES.map((b) => ({ id: b[4], label: b[1], glyph: b[2], color: b[3], hash: b[5] })), ...EXTRA.map((b) => ({ id: b[0], label: b[1], glyph: b[2], color: b[3], hash: b[4] }))];
export const PICKABLE_IDS = PICKABLE.map((b) => b.id);

// d = the saved Discord info, optionally with d.extra = ids the owner added by hand.
export const badgesOf = (d) => {
  const out = BADGES.filter((b) => (d?.flags || 0) & b[0]).map((b) => [b[1], b[2], b[3], b[4], b[5]]);
  if (d?.nitro) out.push(["Nitro", "💎", "#ff73fa", "nitro", "2ba85e8026a8614b640c2837bcdfe21b"]);
  for (const id of d?.extra || []) {
    const b = PICKABLE.find((x) => x.id === id);
    if (b && !out.some((o) => o[3] === id)) out.push([b.label, b.glyph, b.color, b.id, b.hash]);
  }
  return out;
};
