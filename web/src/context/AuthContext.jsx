import { createContext, useCallback, useEffect, useState } from "react";

import { fetchCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    loadCurrentUser();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await loginUser({ identifier, password });
    setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (form) => {
    const data = await registerUser(form);
    setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
