import { api } from "./api";

export async function getTeamLeaderboard({ limit = 20 } = {}) {
  const response = await api.get("/leaderboards/teams", { params: { limit } });
  return response.data.data;
}

export async function getPlayerLeaderboard({ category = "batting", limit = 20 } = {}) {
  const response = await api.get("/leaderboards/players", { params: { category, limit } });
  return response.data.data;
}
