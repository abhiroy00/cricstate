import { api } from "./api";

export async function fetchMyProfile() {
  const response = await api.get("/profiles/me");
  return response.data.data;
}

export async function updateMyProfile(payload) {
  const response = await api.patch("/profiles/me", payload);
  return response.data.data;
}

export async function fetchProfile(userId) {
  const response = await api.get(`/profiles/${userId}`);
  return response.data.data;
}

export async function followUser(userId) {
  await api.post(`/profiles/${userId}/follow`);
}

export async function unfollowUser(userId) {
  await api.delete(`/profiles/${userId}/follow`);
}

export async function fetchFollowers(userId, { limit = 20, offset = 0 } = {}) {
  const response = await api.get(`/profiles/${userId}/followers`, { params: { limit, offset } });
  return response.data.data;
}

export async function fetchFollowing(userId, { limit = 20, offset = 0 } = {}) {
  const response = await api.get(`/profiles/${userId}/following`, { params: { limit, offset } });
  return response.data.data;
}
