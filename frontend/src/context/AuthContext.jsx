import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("finsiem_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("finsiem_token"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("finsiem_token")));

  const logout = useCallback(() => {
    localStorage.removeItem("finsiem_token");
    localStorage.removeItem("finsiem_user");
    setUser(null);
    setToken(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("finsiem_token", data.token);
    localStorage.setItem("finsiem_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    authService.getMe()
      .then((currentUser) => {
        if (mounted) {
          localStorage.setItem("finsiem_user", JSON.stringify(currentUser));
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (mounted) logout();
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token, logout]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    logout
  }), [user, token, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
