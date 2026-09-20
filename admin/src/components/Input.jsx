export default function Input({ label, error, id, ...inputProps }) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={`form-input ${error ? "form-input-error" : ""}`} {...inputProps} />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
