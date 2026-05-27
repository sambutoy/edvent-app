export default function Input({ value, onChange, placeholder, type = "text", error, style: s, onKeyDown, autoFocus }) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown}
      className={`input ${error ? "has-error" : ""}`}
      style={s}
    />
  );
}
