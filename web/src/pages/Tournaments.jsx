import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import TournamentCard from "../components/common/TournamentCard";
import { extractErrorMessage } from "../services/api";
import { createTournament, listTournaments } from "../services/tournamentService";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [format, setFormat] = useState("LEAGUE");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listTournaments();
      setTournaments(data.items);
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
      await createTournament({ name, format });
      setName("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Loader label="Loading tournaments..." />;
  if (error && !tournaments) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Tournaments</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Create Tournament"}</Button>
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleCreate}>
          <Input id="tournament-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="form-field">
            <label className="form-label" htmlFor="format">
              Format
            </label>
            <select id="format" className="form-input" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="LEAGUE">League</option>
              <option value="KNOCKOUT">Knockout</option>
            </select>
          </div>
          <Button type="submit" loading={creating}>
            Create
          </Button>
        </form>
      )}

      {error && <p className="form-error-banner">{error}</p>}

      {tournaments.length === 0 ? (
        <EmptyState message="No tournaments yet. Create the first one!" />
      ) : (
        <div className="entity-grid">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
