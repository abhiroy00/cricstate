import { Link } from "react-router-dom";

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="entity-card">
      <div className="entity-card-avatar">{team.name.charAt(0)}</div>
      <div>
        <div className="entity-card-title">{team.name}</div>
        <div className="entity-card-subtitle">
          {team.player_count} player{team.player_count === 1 ? "" : "s"}
          {team.home_ground ? ` · ${team.home_ground}` : ""}
        </div>
      </div>
    </Link>
  );
}
