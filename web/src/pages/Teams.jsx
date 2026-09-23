import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import TeamCard from "../components/common/TeamCard";
import { extractErrorMessage } from "../services/api";
import { createTeam, listTeams } from "../services/teamService";

export default function Teams() {
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [homeGround, setHomeGround] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listTeams();
      setTeams(data.items);
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
    setCreating(true);
    setError("");
    try {
      await createTeam({ name, home_ground: homeGround || null });
      setName("");
      setHomeGround("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Loader label="Loading teams..." />;
  if (error && !teams) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Teams</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Create Team"}</Button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <Input id="team-name" label="Team name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            id="home-ground"
            label="Home ground (optional)"
            value={homeGround}
            onChange={(e) => setHomeGround(e.target.value)}
          />
          <Button type="submit" loading={creating}>
            Create
          </Button>
        </form>
      )}

      {error && <p className="form-error-banner">{error}</p>}

      {teams.length === 0 ? (
        <EmptyState message="No teams yet. Create the first one!" />
      ) : (
        <div className="entity-grid">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
