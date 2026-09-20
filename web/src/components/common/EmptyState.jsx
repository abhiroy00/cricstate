export default function EmptyState({ message = "Nothing to show yet" }) {
  return (
    <div className="state-block state-empty">
      <p>{message}</p>
    </div>
  );
}
