import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { extractErrorMessage } from "../services/api";
import { getPlayer, getPlayerStats } from "../services/playerService";

export default function PlayerDetail() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [playerData, statsData] = await Promise.all([
        getPlayer(playerId),
        getPlayerStats(playerId),
      ]);
      setPlayer(playerData);
      setStats(statsData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  if (loading) return <Loader label="Loading player..." />;
  if (error && !player) return <ErrorState message={error} onRetry={load} />;
  if (!player) return <EmptyState message="Player not found" />;

  return (
    <div className="detail-page">
      <h1>{player.full_name}</h1>
      <p className="detail-subtitle">
        {player.role?.replace("_", " ")}
        {player.batting_style ? ` · ${player.batting_style}` : ""}
        {player.bowling_style ? ` · ${player.bowling_style}` : ""}
      </p>

      <h2>Career stats</h2>
      <div className="stats-grid">
        <div className="stat-tile">
          <span className="stat-value">{stats.matches_played}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.runs_scored}</span>
          <span className="stat-label">Runs</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.batting_average ?? "—"}</span>
          <span className="stat-label">Batting Avg</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.strike_rate ?? "—"}</span>
          <span className="stat-label">Strike Rate</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.wickets_taken}</span>
          <span className="stat-label">Wickets</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.bowling_average ?? "—"}</span>
          <span className="stat-label">Bowling Avg</span>
        </div>
        <div className="stat-tile">
          <span className="stat-value">{stats.economy_rate ?? "—"}</span>
          <span className="stat-label">Economy</span>
        </div>
      </div>
    </div>
  );
}
