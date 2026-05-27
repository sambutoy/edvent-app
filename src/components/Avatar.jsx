import { initials, aColor } from "../constants/helpers";

export default function Avatar({ name, size = 28 }) {
  const c = aColor(name);
  return (
    <div
      title={name}
      className="avatar"
      style={{
        width: size, height: size,
        background: c + "20", border: `1.5px solid ${c}50`,
        fontSize: size * 0.34, fontWeight: 700, color: c,
      }}
    >
      {initials(name)}
    </div>
  );
}
