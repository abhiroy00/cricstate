import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { extractErrorMessage } from "../services/api";
import { getMatch } from "../services/matchService";
import {
  getLiveState,
  recordDelivery,
  selectNextBowler,
  undoLastDelivery,
} from "../services/scoringService";
import { getRoster } from "../services/teamService";

const WICKET_TYPES = ["BOWLED", "CAUGHT", "LBW", "RUN_OUT", "STUMPED", "HIT_WICKET", "OTHER"];

export default function Scorer() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [battingRoster, setBattingRoster] = useState([]);
  const [bowlingRoster, setBowlingRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [wicketOpen, setWicketOpen] = useState(false);
  const [wicketType, setWicketType] = useState("BOWLED");
  const [outPlayerId, setOutPlayerId] = useState("");
  const [fielderId, setFielderId] = useState("");
  const [nextBatsmanId, setNextBatsmanId] = useState("");
  const [runsWithWicket, setRunsWithWicket] = useState(0);

  const [extraOpen, setExtraOpen] = useState(null);
  const [extraRuns, setExtraRuns] = useState(1);

  const [nextBowlerId, setNextBowlerId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      const state = await getLiveState(matchId);
      setLiveState(state);
      if (state.innings) {
        const [batRoster, bowlRoster] = await Promise.all([
          getRoster(state.innings.batting_team_id),
          getRoster(state.innings.bowling_team_id),
        ]);
        setBattingRoster(batRoster);
        setBowlingRoster(bowlRoster);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function submitDelivery(payload) {
    setBusy(true);
    setError("");
    try {
      await recordDelivery(matchId, payload);
      setWicketOpen(false);
      setExtraOpen(null);
      setOutPlayerId("");
      setFielderId("");
      setNextBatsmanId("");
      setRunsWithWicket(0);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRuns(runs) {
    await submitDelivery({ runs_off_bat: runs });
  }

  async function handleExtraSubmit(type) {
    if (type === "WIDE" || type === "NO_BALL") {
      await submitDelivery({ extra_type: type, extra_runs: extraRuns });
    } else {
      await submitDelivery({ extra_type: type, extra_runs: extraRuns || 1 });
    }
  }

  async function handleWicketSubmit(event) {
    event.preventDefault();
    await submitDelivery({
      runs_off_bat: runsWithWicket,
      is_wicket: true,
      wicket_type: wicketType,
      out_player_id: outPlayerId || undefined,
      fielder_id: fielderId || undefined,
      next_batsman_id: nextBatsmanId || undefined,
    });
  }

  async function handleUndo() {
    setBusy(true);
    setError("");
    try {
      await undoLastDelivery(matchId);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSelectBowler(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await selectNextBowler(matchId, nextBowlerId);
      setNextBowlerId("");
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loader label="Loading scorer..." />;
  if (error && !match) return <ErrorState message={error} onRetry={load} />;
  if (!match || !liveState?.innings) return null;

  const needsBowler = !liveState.innings.current_bowler_id;
  const inningsOver = liveState.innings.status === "COMPLETED";

  return (
    <div className="scorer-page">
      <div className="scorer-header">
        <h1>
          {match.team_a.name} vs {match.team_b.name}
        </h1>
        <Link to={`/matches/${matchId}`}>Back to match</Link>
      </div>

      <div className="live-score">
        <div className="live-score-main">
          {liveState.innings.total_runs}/{liveState.innings.total_wickets}
          <span className="live-score-overs"> ({liveState.innings.overs_display} ov)</span>
        </div>
        <div className="live-score-batsmen">
          <span>
            {liveState.striker?.full_name} * {liveState.striker_runs} ({liveState.striker_balls})
          </span>
          <span>
            {liveState.non_striker?.full_name} {liveState.non_striker_runs} ({liveState.non_striker_balls})
          </span>
        </div>
        {liveState.bowler && (
          <div className="live-score-bowler">
            {liveState.bowler.full_name}: {liveState.bowler_wickets}/{liveState.bowler_runs_conceded} (
            {liveState.bowler_overs})
          </div>
        )}
        <div className="live-score-over-balls">
          {liveState.current_over_balls.map((b, i) => (
            <span key={i} className={`ball-chip ${b === "W" ? "ball-chip-wicket" : ""}`}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      {inningsOver ? (
        <p className="match-result-banner">
          Innings complete. Go back to the match page to start the next innings or end the match.
        </p>
      ) : needsBowler ? (
        <form className="inline-form" onSubmit={handleSelectBowler}>
          <h2>Select next over's bowler</h2>
          <div className="form-field">
            <select
              className="form-input"
              value={nextBowlerId}
              onChange={(e) => setNextBowlerId(e.target.value)}
              required
            >
              <option value="">Select…</option>
              {bowlingRoster.map((entry) => (
                <option key={entry.player.id} value={entry.player.id}>
                  {entry.player.full_name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" loading={busy}>
            Confirm Bowler
          </Button>
        </form>
      ) : (
        <>
          <div className="scorer-buttons">
            {[0, 1, 2, 3, 4, 6].map((runs) => (
              <button key={runs} className="scorer-run-btn" onClick={() => handleRuns(runs)} disabled={busy}>
                {runs}
              </button>
            ))}
          </div>
          <div className="scorer-buttons">
            <button className="scorer-extra-btn" onClick={() => setExtraOpen("WIDE")} disabled={busy}>
              Wide
            </button>
            <button className="scorer-extra-btn" onClick={() => setExtraOpen("NO_BALL")} disabled={busy}>
              No Ball
            </button>
            <button className="scorer-extra-btn" onClick={() => setExtraOpen("BYE")} disabled={busy}>
              Bye
            </button>
            <button className="scorer-extra-btn" onClick={() => setExtraOpen("LEG_BYE")} disabled={busy}>
              Leg Bye
            </button>
            <button className="scorer-wicket-btn" onClick={() => setWicketOpen(true)} disabled={busy}>
              Wicket
            </button>
            <Button variant="secondary" onClick={handleUndo} disabled={busy}>
              Undo Last
            </Button>
          </div>

          {extraOpen && (
            <div className="inline-form">
              <div className="form-field">
                <label className="form-label">
                  {extraOpen === "WIDE" || extraOpen === "NO_BALL" ? "Total extra runs" : "Runs run"}
                </label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={extraRuns}
                  onChange={(e) => setExtraRuns(Number(e.target.value))}
                />
              </div>
              <Button onClick={() => handleExtraSubmit(extraOpen)} loading={busy}>
                Confirm {extraOpen.replace("_", " ")}
              </Button>
              <Button variant="secondary" onClick={() => setExtraOpen(null)}>
                Cancel
              </Button>
            </div>
          )}

          {wicketOpen && (
            <form className="inline-form" onSubmit={handleWicketSubmit}>
              <h2>Wicket</h2>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select className="form-input" value={wicketType} onChange={(e) => setWicketType(e.target.value)}>
                  {WICKET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Batsman out</label>
                <select className="form-input" value={outPlayerId} onChange={(e) => setOutPlayerId(e.target.value)}>
                  <option value="">Striker (default)</option>
                  <option value={liveState.striker?.id}>{liveState.striker?.full_name} (striker)</option>
                  <option value={liveState.non_striker?.id}>{liveState.non_striker?.full_name} (non-striker)</option>
                </select>
              </div>
              {(wicketType === "CAUGHT" || wicketType === "STUMPED" || wicketType === "RUN_OUT") && (
                <div className="form-field">
                  <label className="form-label">Fielder</label>
                  <select className="form-input" value={fielderId} onChange={(e) => setFielderId(e.target.value)} required>
                    <option value="">Select…</option>
                    {bowlingRoster.map((entry) => (
                      <option key={entry.player.id} value={entry.player.id}>
                        {entry.player.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-field">
                <label className="form-label">Runs completed before the wicket</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="6"
                  value={runsWithWicket}
                  onChange={(e) => setRunsWithWicket(Number(e.target.value))}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Next batsman</label>
                <select
                  className="form-input"
                  value={nextBatsmanId}
                  onChange={(e) => setNextBatsmanId(e.target.value)}
                >
                  <option value="">Select…</option>
                  {battingRoster.map((entry) => (
                    <option key={entry.player.id} value={entry.player.id}>
                      {entry.player.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" loading={busy}>
                Confirm Wicket
              </Button>
              <Button variant="secondary" onClick={() => setWicketOpen(false)}>
                Cancel
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
