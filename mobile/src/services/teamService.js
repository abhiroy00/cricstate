import { api } from "./api";

export async function listTeams({ search, createdBy, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/teams", {
    params: { search, created_by: createdBy, limit, offset },
  });
  return response.data.data;
}

export async function listOpponentTeams() {
  const response = await api.get("/teams/opponents");
  return response.data.data;
}

export async function createTeam(payload) {
  const response = await api.post("/teams", payload);
  return response.data.data;
}

export async function getTeam(teamId) {
  const response = await api.get(`/teams/${teamId}`);
  return response.data.data;
}

export async function getRoster(teamId) {
  const response = await api.get(`/teams/${teamId}/roster`);
  return response.data.data;
}

export async function addPlayerToRoster(teamId, payload) {
  const response = await api.post(`/teams/${teamId}/roster`, payload);
  return response.data.data;
}

export async function updateTeamPlayer(teamId, playerId, payload) {
  const response = await api.patch(`/teams/${teamId}/roster/${playerId}`, payload);
  return response.data.data;
}
