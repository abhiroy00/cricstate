import { api } from "./api";

export async function createTeam(payload) {
  const response = await api.post("/teams", payload);
  return response.data.data;
}

export async function listTeams({ search, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/teams", { params: { search, limit, offset } });
  return response.data.data;
}

export async function getTeam(teamId) {
  const response = await api.get(`/teams/${teamId}`);
  return response.data.data;
}

export async function updateTeam(teamId, payload) {
  const response = await api.patch(`/teams/${teamId}`, payload);
  return response.data.data;
}

export async function getRoster(teamId) {
  const response = await api.get(`/teams/${teamId}/roster`);
  return response.data.data;
}

export async function addPlayerToTeam(teamId, payload) {
  const response = await api.post(`/teams/${teamId}/roster`, payload);
  return response.data.data;
}

export async function updateTeamPlayer(teamId, playerId, payload) {
  const response = await api.patch(`/teams/${teamId}/roster/${playerId}`, payload);
  return response.data.data;
}

export async function removePlayerFromTeam(teamId, playerId) {
  await api.delete(`/teams/${teamId}/roster/${playerId}`);
}
