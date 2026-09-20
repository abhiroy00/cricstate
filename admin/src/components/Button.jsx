export default function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${fullWidth ? "btn-full" : ""}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
