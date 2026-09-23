import { api } from "./api";

export async function createPlayer(payload) {
  const response = await api.post("/players", payload);
  return response.data.data;
}

export async function getPlayer(playerId) {
  const response = await api.get(`/players/${playerId}`);
  return response.data.data;
}

export async function getMyPlayer() {
  const response = await api.get("/players/me");
  return response.data.data;
}

export async function getPlayerStats(playerId) {
  const response = await api.get(`/players/${playerId}/stats`);
  return response.data.data;
}
