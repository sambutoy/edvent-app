import { C } from "../constants/colors";

export default function Badge({ status }) {
  const s = C.STATUS[status];
  if (!s) return null;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      <span className="badge-dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
