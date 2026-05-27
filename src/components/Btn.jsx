const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Btn({ onClick, variant = "primary", children, style: s, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variants[variant] || variants.primary}`}
      style={s}
    >
      {children}
    </button>
  );
}
