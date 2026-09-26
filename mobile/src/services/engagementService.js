import { api } from "./api";

// --- Notification preferences ---

export async function getNotificationPreferences() {
  const response = await api.get("/notifications/preferences");
  return response.data.data;
}

export async function updateNotificationPreferences(payload) {
  const response = await api.patch("/notifications/preferences", payload);
  return response.data.data;
}

// --- Looking posts ---

export async function createLookingPost(payload) {
  const response = await api.post("/looking/posts", payload);
  return response.data.data;
}

export async function listLookingPosts({ category, city, status, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/looking/posts", {
    params: { category, city, status, limit, offset },
  });
  return response.data.data;
}

export async function updateLookingPost(postId, payload) {
  const response = await api.patch(`/looking/posts/${postId}`, payload);
  return response.data.data;
}

// --- Community directory ---

export async function createListing(payload) {
  const response = await api.post("/community/listings", payload);
  return response.data.data;
}

export async function listListings({ category, search, city, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/community/listings", {
    params: { category, search, city, limit, offset },
  });
  return response.data.data;
}

export async function getListing(listingId) {
  const response = await api.get(`/community/listings/${listingId}`);
  return response.data.data;
}

export async function updateListing(listingId, payload) {
  const response = await api.patch(`/community/listings/${listingId}`, payload);
  return response.data.data;
}

export async function deleteListing(listingId) {
  const response = await api.delete(`/community/listings/${listingId}`);
  return response.data.data;
}

// --- Listing reviews (community detail screens) ---

export async function createReview(listingId, { rating, text }) {
  const response = await api.post(`/community/listings/${listingId}/reviews`, {
    rating,
    text,
  });
  return response.data.data;
}

export async function listReviews(listingId, { limit = 20, offset = 0 } = {}) {
  const response = await api.get(`/community/listings/${listingId}/reviews`, {
    params: { limit, offset },
  });
  return response.data.data;
}

export async function deleteReview(listingId, reviewId) {
  const response = await api.delete(
    `/community/listings/${listingId}/reviews/${reviewId}`
  );
  return response.data.data;
}

// --- Content reports ---

export async function createReport(payload) {
  const response = await api.post("/reports", payload);
  return response.data.data;
}

// --- Direct messages ---

export async function createConversation(memberIds) {
  const response = await api.post("/dm/conversations", { member_ids: memberIds });
  return response.data.data;
}

export async function listMyConversations({ limit = 20, offset = 0 } = {}) {
  const response = await api.get("/dm/conversations/me", { params: { limit, offset } });
  return response.data.data;
}

export async function listMessages(conversationId, { limit = 50, offset = 0 } = {}) {
  const response = await api.get(`/dm/conversations/${conversationId}/messages`, {
    params: { limit, offset },
  });
  return response.data.data;
}

export async function sendMessage(conversationId, body) {
  const response = await api.post(`/dm/conversations/${conversationId}/messages`, { body });
  return response.data.data;
}
