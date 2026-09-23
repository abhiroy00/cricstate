import { api } from "./api";

export async function createMatch(payload) {
  const response = await api.post("/matches", payload);
  return response.data.data;
}

export async function listMatches({ status, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/matches", { params: { status, limit, offset } });
  return response.data.data;
}

export async function getMatch(matchId) {
  const response = await api.get(`/matches/${matchId}`);
  return response.data.data;
}
