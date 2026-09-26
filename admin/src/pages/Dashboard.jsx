import { useEffect, useState } from "react";

import { extractErrorMessage } from "../services/api";
import { getAdminOverview } from "../services/adminService";

const CARD_KEYS = [
  ["total_users", "Total Users"],
  ["active_users", "Active Users"],
  ["new_users_today", "New Users Today"],
  ["pro_users", "PRO Users"],
  ["total_matches", "Total Matches"],
  ["live_matches", "Live Matches"],
  ["upcoming_matches", "Upcoming Matches"],
  ["completed_matches", "Completed Matches"],
  ["total_tournaments", "Total Tournaments"],
  ["total_teams", "Total Teams"],
  ["total_players", "Total Players"],
  ["orders_today", "Orders Today"],
  ["revenue", "Revenue"],
  ["reported_content", "Reported Content"],
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setStats(await getAdminOverview());
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {loading && <p className="dashboard-note">Loading live metrics…</p>}
      {error && (
        <p className="dashboard-note">
          Could not load metrics: {error}{" "}
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </p>
      )}
      <div className="dashboard-grid">
        {CARD_KEYS.map(([key, title]) => (
          <div className="dashboard-card" key={key}>
            <span className="dashboard-card-title">{title}</span>
            <span className="dashboard-card-value">
              {stats ? String(stats[key] ?? "—") : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
