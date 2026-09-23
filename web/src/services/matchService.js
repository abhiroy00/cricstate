import { api } from "./api";

export async function createMatch(payload) {
  const response = await api.post("/matches", payload);
  return response.data.data;
}

export async function listMatches({ status, teamId, tournamentId, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/matches", {
    params: { status, team_id: teamId, tournament_id: tournamentId, limit, offset },
  });
  return response.data.data;
}

export async function getMatch(matchId) {
  const response = await api.get(`/matches/${matchId}`);
  return response.data.data;
}

export async function recordToss(matchId, payload) {
  const response = await api.post(`/matches/${matchId}/toss`, payload);
  return response.data.data;
}

export async function startMatch(matchId, payload) {
  const response = await api.post(`/matches/${matchId}/start`, payload);
  return response.data.data;
}
