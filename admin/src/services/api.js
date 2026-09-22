import axios from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/storage";

// Falls back to a relative path (resolves against the origin, not the /admin/
// base path) rather than a hardcoded localhost URL - the production build
// doesn't set VITE_API_URL, and nginx proxies /api/* on the same origin as
// this app, so a relative path is what actually works there. Local dev sets
// VITE_API_URL explicitly via admin/.env and takes precedence over this.
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
  const { access_token, refresh_token } = response.data.data;
  setTokens({ accessToken: access_token, refreshToken: refresh_token });
  return access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise || refreshAccessToken();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "Something went wrong";
}
