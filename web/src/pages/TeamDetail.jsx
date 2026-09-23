import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import PlayerCard from "../components/common/PlayerCard";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";
import {
  addPlayerToTeam,
  getRoster,
  getTeam,
  removePlayerFromTeam,
  updateTeamPlayer,
} from "../services/teamService";

export default function TeamDetail() {
  const { teamId } = useParams();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [teamData, rosterData] = await Promise.all([getTeam(teamId), getRoster(teamId)]);
      setTeam(teamData);
      setRoster(rosterData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const isOwner = user?.id === team?.created_by;

  async function handleAddPlayer(event) {
    event.preventDefault();
    setAdding(true);
    setError("");
    try {
      await addPlayerToTeam(teamId, { new_player_full_name: newPlayerName });
      setNewPlayerName("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleCaptain(playerId, current) {
    try {
      await updateTeamPlayer(teamId, playerId, { is_captain: !current });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleRemove(playerId) {
    try {
      await removePlayerFromTeam(teamId, playerId);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <Loader label="Loading team..." />;
  if (error && !team) return <ErrorState message={error} onRetry={load} />;
  if (!team) return <EmptyState message="Team not found" />;

  return (
    <div className="detail-page">
      <h1>{team.name}</h1>
      {team.home_ground && <p className="detail-subtitle">{team.home_ground}</p>}

      {error && <p className="form-error-banner">{error}</p>}

      <div className="detail-section-header">
        <h2>Roster</h2>
        {isOwner && (
          <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add Player"}
          </Button>
        )}
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleAddPlayer}>
          <Input
            id="new-player-name"
            label="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            required
          />
          <Button type="submit" loading={adding}>
            Add
          </Button>
        </form>
      )}

      {roster.length === 0 ? (
        <EmptyState message="No players on this roster yet" />
      ) : (
        <ul className="roster-list">
          {roster.map((entry) => (
            <li key={entry.player.id} className="roster-list-item">
              <PlayerCard player={entry.player} />
              <div className="roster-list-actions">
                {entry.is_captain && <span className="badge">Captain</span>}
                {isOwner && (
                  <>
                    <Button variant="secondary" onClick={() => handleToggleCaptain(entry.player.id, entry.is_captain)}>
                      {entry.is_captain ? "Remove Captain" : "Make Captain"}
                    </Button>
                    <Button variant="secondary" onClick={() => handleRemove(entry.player.id)}>
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
