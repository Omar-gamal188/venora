/* eslint-disable react-refresh/only-export-components -- auth provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { API_BASE } from "../config/api.js";

const TOKEN_KEY = "venora_auth_token";

/** Mirrors server env: primary + comma-separated extra admin usernames. */
function envAdminUsernameSet() {
  const set = new Set();
  const primary = (
    import.meta.env.VITE_DASHBOARD_ADMIN_USERNAME || ""
  ).toLowerCase();
  if (primary) set.add(primary);
  const extra = import.meta.env.VITE_DASHBOARD_ADMIN_USERNAMES || "";
  extra.split(",").forEach((part) => {
    const x = part.trim().toLowerCase();
    if (x) set.add(x);
  });
  return set;
}

const ADMIN_USERNAME_SET = envAdminUsernameSet();

function ensureUserRole(user) {
  if (!user) return user;
  if (user.role === "admin") return user;
  const un = String(user.username || "")
    .trim()
    .toLowerCase();
  if (ADMIN_USERNAME_SET.has(un)) return { ...user, role: "admin" };
  if (user.role === "user") return user;
  return { ...user, role: user.role || "user" };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async (token) => {
    const res = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(ensureUserRole(res.data.user));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        await fetchMe(token);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  const login = useCallback(
    async (username, password) => {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        username,
        password,
      });
      const { token, user: u } = res.data;
      const fixed = ensureUserRole(u);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(fixed);
      return fixed;
    },
    [],
  );

  const register = useCallback(
    async (payload) => {
      const res = await axios.post(`${API_BASE}/api/auth/register`, payload);
      const { token, user: u } = res.data;
      const fixed = ensureUserRole(u);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(fixed);
      return fixed;
    },
    [],
  );

  const logout = useCallback(() => {
    // Best-effort server-side session revocation (refresh token invalidated).
    axios.post(`${API_BASE}/api/auth/logout`).catch(() => {});
    clearSession();
    // App uses a HashRouter and this provider lives outside it, so navigate
    // by hash: always land on the home page after logging out.
    if (window.location.hash !== "#/") {
      window.location.hash = "#/";
    }
  }, [clearSession]);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      getToken,
    }),
    [user, ready, login, register, logout, getToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
