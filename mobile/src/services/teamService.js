import { api } from "./api";

export async function listTeams({ search, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/teams", { params: { search, limit, offset } });
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
