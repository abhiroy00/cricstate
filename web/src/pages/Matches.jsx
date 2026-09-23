import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import MatchCard from "../components/common/MatchCard";
import { extractErrorMessage } from "../services/api";
import { createMatch, listMatches } from "../services/matchService";
import { listTeams } from "../services/teamService";

export default function Matches() {
  const [matches, setMatches] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [matchType, setMatchType] = useState("T20");
  const [oversLimit, setOversLimit] = useState(20);
  const [venue, setVenue] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [matchesData, teamsData] = await Promise.all([
        listMatches(),
        listTeams({ limit: 100 }),
      ]);
      setMatches(matchesData.items);
      setTeams(teamsData.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    if (teamAId === teamBId) {
      setError("A team cannot play itself");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await createMatch({
        team_a_id: teamAId,
        team_b_id: teamBId,
        match_type: matchType,
        overs_limit: Number(oversLimit),
        venue: venue || null,
      });
      setShowForm(false);
      setTeamAId("");
      setTeamBId("");
      setVenue("");
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Loader label="Loading matches..." />;
  if (error && !matches) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Matches</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Create Match"}</Button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <div className="form-field">
            <label className="form-label" htmlFor="team-a">
              Team A
            </label>
            <select id="team-a" className="form-input" value={teamAId} onChange={(e) => setTeamAId(e.target.value)} required>
              <option value="">Select…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="team-b">
              Team B
            </label>
            <select id="team-b" className="form-input" value={teamBId} onChange={(e) => setTeamBId(e.target.value)} required>
              <option value="">Select…</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="match-type">
              Match type
            </label>
            <select
              id="match-type"
              className="form-input"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
            >
              <option value="T20">T20</option>
              <option value="ODI">ODI</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <Input
            id="overs-limit"
            label="Overs"
            type="number"
            min="1"
            value={oversLimit}
            onChange={(e) => setOversLimit(e.target.value)}
            required
          />
          <Input id="venue" label="Venue (optional)" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <Button type="submit" loading={creating}>
            Create
          </Button>
        </form>
      )}

      {error && <p className="form-error-banner">{error}</p>}

      {matches.length === 0 ? (
        <EmptyState message="No matches yet. Create the first one!" />
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
