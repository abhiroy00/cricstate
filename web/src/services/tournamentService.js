import { api } from "./api";

export async function createTournament(payload) {
  const response = await api.post("/tournaments", payload);
  return response.data.data;
}

export async function listTournaments({ status, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/tournaments", { params: { status, limit, offset } });
  return response.data.data;
}

export async function getTournament(tournamentId) {
  const response = await api.get(`/tournaments/${tournamentId}`);
  return response.data.data;
}

export async function updateTournament(tournamentId, payload) {
  const response = await api.patch(`/tournaments/${tournamentId}`, payload);
  return response.data.data;
}

export async function listTournamentTeams(tournamentId) {
  const response = await api.get(`/tournaments/${tournamentId}/teams`);
  return response.data.data;
}

export async function registerTeam(tournamentId, teamId) {
  const response = await api.post(`/tournaments/${tournamentId}/teams`, { team_id: teamId });
  return response.data.data;
}

export async function updateRegistration(tournamentId, teamId, status) {
  const response = await api.patch(`/tournaments/${tournamentId}/teams/${teamId}`, { status });
  return response.data.data;
}

export async function getPointsTable(tournamentId) {
  const response = await api.get(`/tournaments/${tournamentId}/points-table`);
  return response.data.data;
}
