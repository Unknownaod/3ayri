/*
Round logo. Shows the image when `logo` is set, otherwise the
affiliate's initials on an accent-colored background.
*/

export default function Avatar({ name, logo, size = 48, accent = "#8b3cff" }) {
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        "--accent": accent,
      }}
    >
      {logo ? <img src={logo} alt="" /> : initials}
    </span>
  );
}
