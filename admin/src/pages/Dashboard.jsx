const CARDS = [
  "Total Users",
  "Active Users",
  "New Users Today",
  "PRO Users",
  "Total Matches",
  "Live Matches",
  "Upcoming Matches",
  "Total Tournaments",
  "Live Viewers",
  "Orders Today",
  "Revenue",
  "Reported Content",
];

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p className="dashboard-note">
        Live metrics and charts (user growth, match growth, revenue, engagement) are wired up
        in Phase 9 once the underlying modules exist. This is the layout shell.
      </p>
      <div className="dashboard-grid">
        {CARDS.map((title) => (
          <div className="dashboard-card" key={title}>
            <span className="dashboard-card-title">{title}</span>
            <span className="dashboard-card-value">—</span>
          </div>
        ))}
      </div>
    </div>
  );
}
