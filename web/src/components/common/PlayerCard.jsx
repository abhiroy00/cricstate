import { Link } from "react-router-dom";

export default function PlayerCard({ player }) {
  return (
    <Link to={`/players/${player.id}`} className="entity-card">
      <div className="entity-card-avatar">{player.full_name.charAt(0)}</div>
      <div>
        <div className="entity-card-title">{player.full_name}</div>
        <div className="entity-card-subtitle">{player.role?.replace("_", " ")}</div>
      </div>
    </Link>
  );
}
