import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";
import { getMatch, recordToss, startMatch } from "../services/matchService";
import { endMatch, getLiveState, getScorecard, startNextInnings } from "../services/scoringService";
import { getRoster } from "../services/teamService";

function TossForm({ match, onDone }) {
  const [winnerId, setWinnerId] = useState(match.team_a.id);
  const [decision, setDecision] = useState("BAT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await recordToss(match.id, { toss_winner_team_id: winnerId, toss_decision: decision });
      onDone();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h2>Toss</h2>
      {error && <p className="form-error-banner">{error}</p>}
      <div className="form-field">
        <label className="form-label">Winner</label>
        <select className="form-input" value={winnerId} onChange={(e) => setWinnerId(e.target.value)}>
          <option value={match.team_a.id}>{match.team_a.name}</option>
          <option value={match.team_b.id}>{match.team_b.name}</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Decision</label>
        <select className="form-input" value={decision} onChange={(e) => setDecision(e.target.value)}>
          <option value="BAT">Bat</option>
          <option value="BOWL">Bowl</option>
        </select>
      </div>
      <Button type="submit" loading={submitting}>
        Record Toss
      </Button>
    </form>
  );
}

function StartMatchForm({ match, onDone }) {
  const battingFirstIsWinner = match.toss_decision === "BAT";
  const winnerIsTeamA = match.toss_winner_team_id === match.team_a.id;
  const battingTeam = winnerIsTeamA === battingFirstIsWinner ? match.team_a : match.team_b;
  const bowlingTeam = battingTeam.id === match.team_a.id ? match.team_b : match.team_a;

  const [battingRoster, setBattingRoster] = useState([]);
  const [bowlingRoster, setBowlingRoster] = useState([]);
  const [strikerId, setStrikerId] = useState("");
  const [nonStrikerId, setNonStrikerId] = useState("");
  const [bowlerId, setBowlerId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getRoster(battingTeam.id), getRoster(bowlingTeam.id)]).then(([bat, bowl]) => {
      setBattingRoster(bat);
      setBowlingRoster(bowl);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battingTeam.id, bowlingTeam.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await startMatch(match.id, {
        striker_id: strikerId,
        non_striker_id: nonStrikerId,
        bowler_id: bowlerId,
      });
      onDone();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <h2>Start Match</h2>
      <p className="detail-subtitle">
        {battingTeam.name} bat first, {bowlingTeam.name} bowl first
      </p>
      {error && <p className="form-error-banner">{error}</p>}
      <div className="form-field">
        <label className="form-label">Striker</label>
        <select className="form-input" value={strikerId} onChange={(e) => setStrikerId(e.target.value)} required>
          <option value="">Select…</option>
          {battingRoster.map((entry) => (
            <option key={entry.player.id} value={entry.player.id}>
              {entry.player.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Non-striker</label>
        <select className="form-input" value={nonStrikerId} onChange={(e) => setNonStrikerId(e.target.value)} required>
          <option value="">Select…</option>
          {battingRoster.map((entry) => (
            <option key={entry.player.id} value={entry.player.id}>
              {entry.player.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Opening bowler</label>
        <select className="form-input" value={bowlerId} onChange={(e) => setBowlerId(e.target.value)} required>
          <option value="">Select…</option>
          {bowlingRoster.map((entry) => (
            <option key={entry.player.id} value={entry.player.id}>
              {entry.player.full_name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" loading={submitting}>
        Start Match
      </Button>
    </form>
  );
}

function LiveScore({ liveState }) {
  const { innings } = liveState;
  if (!innings) return null;
  return (
    <div className="live-score">
      <div className="live-score-main">
        {innings.total_runs}/{innings.total_wickets}
        <span className="live-score-overs"> ({innings.overs_display} ov)</span>
      </div>
      <div className="live-score-batsmen">
        <span>
          {liveState.striker?.full_name} * {liveState.striker_runs} ({liveState.striker_balls})
        </span>
        <span>
          {liveState.non_striker?.full_name} {liveState.non_striker_runs} ({liveState.non_striker_balls})
        </span>
      </div>
      <div className="live-score-bowler">
        {liveState.bowler?.full_name}: {liveState.bowler_wickets}/{liveState.bowler_runs_conceded} (
        {liveState.bowler_overs})
      </div>
      <div className="live-score-over-balls">
        {liveState.current_over_balls.map((b, i) => (
          <span key={i} className={`ball-chip ${b === "W" ? "ball-chip-wicket" : ""}`}>
            {b}
          </span>
        ))}
      </div>
      <div className="live-score-rr">
        CRR: {liveState.run_rate}
        {liveState.required_run_rate != null && (
          <>
            {" "}
            · RRR: {liveState.required_run_rate} · Need {liveState.runs_needed} off {liveState.balls_remaining} balls
          </>
        )}
      </div>
    </div>
  );
}

function Scorecard({ scorecard }) {
  return (
    <div>
      {scorecard.innings.map((inn) => (
        <div key={inn.innings.id} className="scorecard-innings">
          <h3>
            Innings {inn.innings.innings_number}: {inn.innings.total_runs}/{inn.innings.total_wickets} (
            {inn.innings.overs_display} ov)
          </h3>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batter</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                  <th>Dismissal</th>
                </tr>
              </thead>
              <tbody>
                {inn.batting.map((b) => (
                  <tr key={b.player.id}>
                    <td>{b.player.full_name}</td>
                    <td>{b.runs}</td>
                    <td>{b.balls_faced}</td>
                    <td>{b.fours}</td>
                    <td>{b.sixes}</td>
                    <td>{b.strike_rate}</td>
                    <td>{b.is_out ? b.dismissal : "not out"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>O</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Econ</th>
                </tr>
              </thead>
              <tbody>
                {inn.bowling.map((b) => (
                  <tr key={b.player.id}>
                    <td>{b.player.full_name}</td>
                    <td>{b.overs}</td>
                    <td>{b.runs_conceded}</td>
                    <td>{b.wickets}</td>
                    <td>{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MatchDetail() {
  const { matchId } = useParams();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      if (matchData.status === "LIVE") {
        setLiveState(await getLiveState(matchId));
      } else if (matchData.status === "COMPLETED") {
        setScorecard(await getScorecard(matchId));
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

  const isScorer = user && match && (user.id === match.created_by || user.id === match.scorer_id);

  async function handleStartNextInnings() {
    const battingTeamId = liveState.innings.bowling_team_id;
    const bowlingTeamId = liveState.innings.batting_team_id;
    const [battingRoster, bowlingRoster] = await Promise.all([
      getRoster(battingTeamId),
      getRoster(bowlingTeamId),
    ]);
    try {
      await startNextInnings(matchId, {
        striker_id: battingRoster[0].player.id,
        non_striker_id: battingRoster[1].player.id,
        bowler_id: bowlingRoster[0].player.id,
      });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleEndMatch() {
    try {
      await endMatch(matchId);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) return <Loader label="Loading match..." />;
  if (error && !match) return <ErrorState message={error} onRetry={load} />;
  if (!match) return null;

  return (
    <div className="detail-page">
      <h1>
        {match.team_a.name} vs {match.team_b.name}
      </h1>
      <p className="detail-subtitle">
        {match.match_type} · {match.overs_limit} overs
        {match.venue ? ` · ${match.venue}` : ""} · {match.status}
      </p>
      {match.result_summary && <p className="match-result-banner">{match.result_summary}</p>}

      {error && <p className="form-error-banner">{error}</p>}

      {match.status === "SCHEDULED" && !match.toss_winner_team_id && isScorer && (
        <TossForm match={match} onDone={load} />
      )}
      {match.status === "SCHEDULED" && match.toss_winner_team_id && isScorer && (
        <StartMatchForm match={match} onDone={load} />
      )}

      {match.status === "LIVE" && liveState && (
        <>
          <LiveScore liveState={liveState} />
          {isScorer && (
            <div className="detail-section-header">
              <Link to={`/matches/${matchId}/scorer`}>
                <Button>Open Scorer</Button>
              </Link>
              {liveState.innings.status === "COMPLETED" && liveState.innings.innings_number === 1 && (
                <Button variant="secondary" onClick={handleStartNextInnings}>
                  Start Next Innings
                </Button>
              )}
              {liveState.innings.status === "COMPLETED" && liveState.innings.innings_number === 2 && (
                <Button variant="secondary" onClick={handleEndMatch}>
                  End Match
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {match.status === "COMPLETED" && scorecard && <Scorecard scorecard={scorecard} />}
    </div>
  );
}
