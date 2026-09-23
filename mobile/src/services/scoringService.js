import { api } from "./api";

export async function getLiveState(matchId) {
  const response = await api.get(`/scoring/${matchId}/live`);
  return response.data.data;
}

export async function getScorecard(matchId) {
  const response = await api.get(`/scoring/${matchId}/scorecard`);
  return response.data.data;
}
