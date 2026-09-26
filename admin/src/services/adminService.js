import { api } from "./api";

export async function getAdminOverview() {
  const response = await api.get("/admin/overview");
  return response.data.data;
}

export async function listReports({ status, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/reports", { params: { status, limit, offset } });
  return response.data.data;
}

export async function setReportStatus(reportId, status) {
  const response = await api.patch(`/reports/${reportId}`, { status });
  return response.data.data;
}

export async function createProduct(payload) {
  const response = await api.post("/store/products", payload);
  return response.data.data;
}

export async function updateProduct(productId, payload) {
  const response = await api.patch(`/store/products/${productId}`, payload);
  return response.data.data;
}

export async function verifyListing(listingId, isVerified) {
  const response = await api.patch(`/community/listings/${listingId}`, {
    is_verified: isVerified,
  });
  return response.data.data;
}

export async function deleteListing(listingId) {
  const response = await api.delete(`/community/listings/${listingId}`);
  return response.data.data;
}

export async function deleteReview(listingId, reviewId) {
  const response = await api.delete(
    `/community/listings/${listingId}/reviews/${reviewId}`
  );
  return response.data.data;
}
