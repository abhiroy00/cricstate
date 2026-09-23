import { useEffect, useState } from "react";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import PlayerCard from "../components/common/PlayerCard";
import { extractErrorMessage } from "../services/api";
import { listPlayers } from "../services/playerService";

export default function Players() {
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listPlayers();
      setPlayers(data.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Loading players..." />;
  if (error && !players) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Players</h1>
      </div>
      {players.length === 0 ? (
        <EmptyState message="No players yet" />
      ) : (
        <div className="entity-grid">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
