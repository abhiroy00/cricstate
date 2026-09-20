import { api } from "./api";

export async function registerUser({ email, username, password, fullName, phone }) {
  const response = await api.post("/auth/register", {
    email,
    username,
    password,
    full_name: fullName,
    phone: phone || null,
  });
  return response.data.data;
}

export async function loginUser({ identifier, password }) {
  const response = await api.post("/auth/login", { identifier, password });
  return response.data.data;
}

export async function logoutUser(refreshToken) {
  await api.post("/auth/logout", { refresh_token: refreshToken });
}

export async function fetchCurrentUser() {
  const response = await api.get("/users/me");
  return response.data.data;
}
