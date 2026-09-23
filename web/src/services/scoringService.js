import { api } from "./api";

export async function recordDelivery(matchId, payload) {
  const response = await api.post(`/scoring/${matchId}/deliveries`, payload);
  return response.data.data;
}

export async function undoLastDelivery(matchId) {
  await api.delete(`/scoring/${matchId}/deliveries/last`);
}

export async function selectNextBowler(matchId, bowlerId) {
  const response = await api.post(`/scoring/${matchId}/next-over`, { bowler_id: bowlerId });
  return response.data.data;
}

export async function startNextInnings(matchId, payload) {
  const response = await api.post(`/scoring/${matchId}/next-innings`, payload);
  return response.data.data;
}

export async function endMatch(matchId) {
  const response = await api.post(`/scoring/${matchId}/end`);
  return response.data.data;
}

export async function getLiveState(matchId) {
  const response = await api.get(`/scoring/${matchId}/live`);
  return response.data.data;
}

export async function getScorecard(matchId) {
  const response = await api.get(`/scoring/${matchId}/scorecard`);
  return response.data.data;
}
