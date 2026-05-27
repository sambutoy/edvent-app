export default function Field({ label, error, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field-label">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="field-error">{error}</p>
      )}
    </div>
  );
}
