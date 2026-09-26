import { api } from "./api";

export async function listProducts({ search, category, activeOnly = true, limit = 20, offset = 0 } = {}) {
  const response = await api.get("/store/products", {
    params: { search, category, active_only: activeOnly, limit, offset },
  });
  return response.data.data;
}

export async function getProduct(productId) {
  const response = await api.get(`/store/products/${productId}`);
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

export async function createOrder(items) {
  const response = await api.post("/store/orders", { items });
  return response.data.data;
}

export async function listMyOrders({ limit = 20, offset = 0 } = {}) {
  const response = await api.get("/store/orders/me", { params: { limit, offset } });
  return response.data.data;
}

export async function getOrder(orderId) {
  const response = await api.get(`/store/orders/${orderId}`);
  return response.data.data;
}

export async function payOrder(orderId) {
  const response = await api.post(`/store/orders/${orderId}/pay`);
  return response.data.data;
}

export async function confirmOrderPayment(orderId, paymentId) {
  const response = await api.post(`/store/orders/${orderId}/confirm`, {
    payment_id: paymentId,
  });
  return response.data.data;
}

export async function cancelOrder(orderId) {
  const response = await api.post(`/store/orders/${orderId}/cancel`);
  return response.data.data;
}
