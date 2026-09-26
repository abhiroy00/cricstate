import { useEffect, useState } from "react";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import MatchCard from "../components/common/MatchCard";
import PlayerCard from "../components/common/PlayerCard";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";
import { getHomeFeed } from "../services/homeService";

export default function Home() {
  const { user } = useAuth();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setFeed(await getHomeFeed());
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Loading home feed..." />;
  if (error && !feed) return <ErrorState message={error} onRetry={load} />;

  const counts = feed?.counts || {};

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Welcome, {user?.full_name}! 🏏</h1>
      </div>

      {(counts.live_matches != null || counts.teams != null) && (
        <div className="stat-strip">
          {counts.live_matches != null && <span>🔴 {counts.live_matches} live</span>}
          {counts.teams != null && <span>· {counts.teams} teams</span>}
          {counts.tournaments != null && <span>· {counts.tournaments} tournaments</span>}
          {counts.players != null && <span>· {counts.players} players</span>}
        </div>
      )}

      <h2>Live now</h2>
      {feed.live_matches.length === 0 ? (
        <EmptyState message="No live matches right now." />
      ) : (
        <div className="entity-grid">
          {feed.live_matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <h2>Upcoming</h2>
      {feed.upcoming_matches.length === 0 ? (
        <EmptyState message="No upcoming matches." />
      ) : (
        <div className="entity-grid">
          {feed.upcoming_matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <h2>Recent results</h2>
      {feed.recent_results.length === 0 ? (
        <EmptyState message="No completed matches yet." />
      ) : (
        <div className="entity-grid">
          {feed.recent_results.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      <h2>Suggested cricketers</h2>
      {feed.suggested_cricketers.length === 0 ? (
        <EmptyState message="No players to suggest yet." />
      ) : (
        <div className="entity-grid">
          {feed.suggested_cricketers.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}
