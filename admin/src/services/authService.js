import { api } from "./api";

export async function loginAdmin({ identifier, password }) {
  const response = await api.post("/auth/login", { identifier, password });
  return response.data.data;
}

export async function logoutAdmin(refreshToken) {
  await api.post("/auth/logout", { refresh_token: refreshToken });
}

export async function fetchCurrentAdmin() {
  const response = await api.get("/users/me");
  return response.data.data;
}
