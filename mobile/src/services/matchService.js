import { api } from "./api";

export async function createMatch(payload) {
  const response = await api.post("/matches", payload);
  return response.data.data;
}

export async function listMatches({ status, teamId, tournamentId, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/matches", {
    params: {
      status,
      team_id: teamId,
      tournament_id: tournamentId,
      limit,
      offset,
    },
  });
  return response.data.data;
}

export async function getMatch(matchId) {
  const response = await api.get(`/matches/${matchId}`);
  return response.data.data;
}

export async function updateMatch(matchId, payload) {
  const response = await api.patch(`/matches/${matchId}`, payload);
  return response.data.data;
}

export async function recordToss(matchId, { tossWinnerTeamId, tossDecision }) {
  const response = await api.post(`/matches/${matchId}/toss`, {
    toss_winner_team_id: tossWinnerTeamId,
    toss_decision: tossDecision,
  });
  return response.data.data;
}

export async function startMatch(matchId, { strikerId, nonStrikerId, bowlerId }) {
  const response = await api.post(`/matches/${matchId}/start`, {
    striker_id: strikerId,
    non_striker_id: nonStrikerId,
    bowler_id: bowlerId,
  });
  return response.data.data;
}

export async function getLineups(matchId) {
  const response = await api.get(`/matches/${matchId}/lineups`);
  return response.data.data;
}

export async function setLineups(matchId, { teamId, players, isPlayingXi = true }) {
  const response = await api.put(`/matches/${matchId}/lineups`, {
    team_id: teamId,
    players,
    is_playing_xi: isPlayingXi,
  });
  return response.data.data;
}
