import Button from "./Button";

export default function ErrorState({ message = "Something went wrong", onRetry }) {
  return (
    <div className="state-block state-error">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  );
}
