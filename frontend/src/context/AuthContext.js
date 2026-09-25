import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = signed out
  const [credits, setCredits] = useState(1);

  const applyUser = useCallback((u) => {
    setUser(u);
    if (u) setCredits(u.credits ?? 1);
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => applyUser(r.data))
      .catch(() => setUser(false));
  }, [applyUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    applyUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    applyUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, credits, setCredits, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
