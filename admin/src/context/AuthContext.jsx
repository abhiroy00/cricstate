import { createContext, useCallback, useEffect, useState } from "react";

import { fetchCurrentAdmin, loginAdmin, logoutAdmin } from "../services/authService";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../utils/storage";
import { hasAdminAccess } from "../utils/roles";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentAdmin() {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentAdmin();
        setUser(currentUser);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    loadCurrentAdmin();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await loginAdmin({ identifier, password });
    if (!hasAdminAccess(data.user)) {
      throw new Error("This account does not have admin access");
    }
    setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await logoutAdmin(refreshToken);
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
    isAdmin: hasAdminAccess(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
