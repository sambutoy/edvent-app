export function EdVentLogoSVG({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="edGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F9E8E" />
          <stop offset="100%" stopColor="#1B3A6B" />
        </linearGradient>
      </defs>
      <path d="M8 20 L8 80 L38 80 L38 68 L20 68 L20 56 L34 56 L34 44 L20 44 L20 32 L38 32 L38 20 Z" fill="url(#edGrad)" />
      <path d="M44 20 L44 80 L62 80 Q82 80 82 50 Q82 20 62 20 Z M56 32 L62 32 Q70 32 70 50 Q70 68 62 68 L56 68 Z" fill="url(#edGrad)" />
      <path d="M50 10 L54 30 L50 35 L46 30 Z" fill="#0F9E8E" opacity="0.9" />
      <path d="M50 35 L48 42 L50 40 L52 42 Z" fill="#1B3A6B" />
      <path d="M50 22 L51.5 26.5 L56 26.5 L52.5 29 L54 33.5 L50 31 L46 33.5 L47.5 29 L44 26.5 L48.5 26.5 Z" fill="#E8A020" />
      <path d="M20 88 Q35 82 50 86 Q65 90 80 84" stroke="#0F9E8E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M72 78 L80 84 L76 92" stroke="#0F9E8E" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoSidebar({ collapsed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, userSelect: "none", width: "100%" }}>
      <img
        src="/704326440_26913731668288924_4202292170860335683_n.png"
        alt="EdVent"
        style={{ height: collapsed ? 36 : 40, width: "auto", display: "block", flexShrink: 0 }}
      />
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: "#fff", lineHeight: 1, whiteSpace: "nowrap" }}>
            EdVent
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: "rgba(238,242,248,0.7)", lineHeight: 1.5, whiteSpace: "nowrap" }}>
            Event Management
          </div>
        </div>
      )}
    </div>
  );
}
