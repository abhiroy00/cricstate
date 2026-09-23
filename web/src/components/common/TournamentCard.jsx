import { Link } from "react-router-dom";

const STATUS_LABEL = {
  UPCOMING: "Upcoming",
  ONGOING: "Live",
  COMPLETED: "Completed",
};

export default function TournamentCard({ tournament }) {
  return (
    <Link to={`/tournaments/${tournament.id}`} className="entity-card">
      <div className="entity-card-avatar">🏆</div>
      <div>
        <div className="entity-card-title">{tournament.name}</div>
        <div className="entity-card-subtitle">
          {STATUS_LABEL[tournament.status] || tournament.status} · {tournament.team_count} team
          {tournament.team_count === 1 ? "" : "s"}
        </div>
      </div>
    </Link>
  );
}
