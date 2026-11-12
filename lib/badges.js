// Discord public_flags bit -> [bit, label, glyph, color]
export const BADGES = [[1, "Discord Staff", "🛡️", "#5865f2"], [2, "Partnered Server Owner", "🤝", "#5865f2"], [4, "HypeSquad Events", "🎉", "#f9a21c"], [8, "Bug Hunter", "🐛", "#3ba55d"],
  [64, "HypeSquad Bravery", "🟣", "#9c84ef"], [128, "HypeSquad Brilliance", "🟠", "#f47b67"], [256, "HypeSquad Balance", "🟢", "#45ddc0"], [512, "Early Supporter", "🌅", "#7289da"],
  [16384, "Bug Hunter Gold", "🐞", "#f2b01e"], [131072, "Early Verified Bot Developer", "🤖", "#5865f2"], [262144, "Certified Moderator", "⚖️", "#3ba55d"], [4194304, "Active Developer", "⚡", "#3ba55d"]];
export const badgesOf = (d) => [...BADGES.filter((b) => (d?.flags || 0) & b[0]).map((b) => [b[1], b[2], b[3]]), ...(d?.nitro ? [["Nitro", "💎", "#ff73fa"]] : [])];
