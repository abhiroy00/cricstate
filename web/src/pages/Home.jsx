import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-placeholder">
      <h1>Welcome, {user?.full_name}! 🏏</h1>
      <p>
        Your feed, live matches, tournaments and community posts will land here in the
        upcoming phases. Phase 1 wires up the account you just created.
      </p>
    </div>
  );
}
