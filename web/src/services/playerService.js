import { api } from "./api";

export async function createPlayer(payload) {
  const response = await api.post("/players", payload);
  return response.data.data;
}

export async function listPlayers({ search, role, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/players", { params: { search, role, limit, offset } });
  return response.data.data;
}

export async function getPlayer(playerId) {
  const response = await api.get(`/players/${playerId}`);
  return response.data.data;
}

export async function updatePlayer(playerId, payload) {
  const response = await api.patch(`/players/${playerId}`, payload);
  return response.data.data;
}

export async function getPlayerStats(playerId) {
  const response = await api.get(`/players/${playerId}/stats`);
  return response.data.data;
}
