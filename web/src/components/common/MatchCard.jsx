import { Link } from "react-router-dom";

const STATUS_LABEL = {
  SCHEDULED: "Upcoming",
  LIVE: "🔴 LIVE",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

export default function MatchCard({ match }) {
  return (
    <Link to={`/matches/${match.id}`} className={`match-card ${match.status === "LIVE" ? "match-card-live" : ""}`}>
      <div className="match-card-status">{STATUS_LABEL[match.status] || match.status}</div>
      <div className="match-card-teams">
        <span>{match.team_a.name}</span>
        <span className="match-card-vs">vs</span>
        <span>{match.team_b.name}</span>
      </div>
      <div className="match-card-meta">
        {match.match_type} · {match.overs_limit} overs
        {match.venue ? ` · ${match.venue}` : ""}
      </div>
      {match.result_summary && <div className="match-card-result">{match.result_summary}</div>}
    </Link>
  );
}
