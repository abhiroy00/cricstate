import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import MatchCard from "../components/common/MatchCard";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";
import { listMatches } from "../services/matchService";
import { listTeams } from "../services/teamService";
import {
  getPointsTable,
  getTournament,
  listTournamentTeams,
  registerTeam,
  updateRegistration,
} from "../services/tournamentService";

export default function TournamentDetail() {
  const { tournamentId } = useParams();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState(null);
  const [pointsTable, setPointsTable] = useState(null);
  const [matches, setMatches] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [tournamentData, teamsData, pointsData, matchesData, allTeams] = await Promise.all([
        getTournament(tournamentId),
        listTournamentTeams(tournamentId),
        getPointsTable(tournamentId),
        listMatches({ tournamentId }),
        listTeams({ limit: 100 }),
      ]);
      setTournament(tournamentData);
      setTeams(teamsData);
      setPointsTable(pointsData);
      setMatches(matchesData.items);
      setMyTeams(allTeams.items.filter((t) => t.created_by === user?.id));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  const isOrganizer = user?.id === tournament?.organizer_id;

  async function handleRegister(event) {
    event.preventDefault();
    if (!selectedTeamId) return;
    try {
      await registerTeam(tournamentId, selectedTeamId);
      setSelectedTeamId("");
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleApprove(teamId, status) {
    try {
      await updateRegistration(tournamentId, teamId, status);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <Loader label="Loading tournament..." />;
  if (error && !tournament) return <ErrorState message={error} onRetry={load} />;
  if (!tournament) return <EmptyState message="Tournament not found" />;

  const registeredTeamIds = new Set(teams.map((t) => t.team.id));
  const availableTeams = myTeams.filter((t) => !registeredTeamIds.has(t.id));

  return (
    <div className="detail-page">
      <h1>{tournament.name}</h1>
      <p className="detail-subtitle">
        {tournament.format} · {tournament.status}
        {tournament.location ? ` · ${tournament.location}` : ""}
      </p>
      {tournament.description && <p>{tournament.description}</p>}

      {error && <p className="form-error-banner">{error}</p>}

      <h2>Teams</h2>
      {availableTeams.length > 0 && (
        <form className="inline-form" onSubmit={handleRegister}>
          <div className="form-field">
            <label className="form-label" htmlFor="team-select">
              Register one of your teams
            </label>
            <select
              id="team-select"
              className="form-input"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">Select a team…</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Register</Button>
        </form>
      )}

      {teams.length === 0 ? (
        <EmptyState message="No teams registered yet" />
      ) : (
        <ul className="roster-list">
          {teams.map((entry) => (
            <li key={entry.team.id} className="roster-list-item">
              <Link to={`/teams/${entry.team.id}`}>{entry.team.name}</Link>
              <div className="roster-list-actions">
                <span className={`badge badge-${entry.status.toLowerCase()}`}>{entry.status}</span>
                {isOrganizer && entry.status === "PENDING" && (
                  <>
                    <Button variant="secondary" onClick={() => handleApprove(entry.team.id, "APPROVED")}>
                      Approve
                    </Button>
                    <Button variant="secondary" onClick={() => handleApprove(entry.team.id, "REJECTED")}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Points Table</h2>
      {pointsTable.length === 0 ? (
        <EmptyState message="No completed matches yet" />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>T</th>
                <th>Pts</th>
                <th>NRR</th>
              </tr>
            </thead>
            <tbody>
              {pointsTable.map((row) => (
                <tr key={row.team.id}>
                  <td>{row.team.name}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.lost}</td>
                  <td>{row.tied}</td>
                  <td>{row.points}</td>
                  <td>{row.net_run_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Matches</h2>
      {matches.length === 0 ? (
        <EmptyState message="No matches scheduled yet" />
      ) : (
        <div className="entity-grid">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
