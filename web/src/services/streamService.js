import { api } from "./api";

export async function listStreams({ matchId, status, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/streams", {
    params: { match_id: matchId, status, limit, offset },
  });
  return response.data.data;
}

export async function getStreamByMatch(matchId) {
  const response = await api.get(`/streams/by-match/${matchId}`);
  return response.data.data;
}

export async function getStream(streamId) {
  const response = await api.get(`/streams/${streamId}`);
  return response.data.data;
}

export async function createStream(payload) {
  const response = await api.post("/streams", payload);
  return response.data.data;
}

export async function updateStream(streamId, payload) {
  const response = await api.patch(`/streams/${streamId}`, payload);
  return response.data.data;
}

export async function heartbeat(streamId, viewerCount) {
  const response = await api.post(`/streams/${streamId}/heartbeat`, {
    viewer_count: viewerCount,
  });
  return response.data.data;
}

export async function deleteStream(streamId) {
  const response = await api.delete(`/streams/${streamId}`);
  return response.data.data;
}
