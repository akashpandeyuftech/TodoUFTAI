import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getMe, logout as apiLogout } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = await getToken();
      if (!token) { setUser(null); return; }
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  const signOut = async () => {
    await apiLogout();
    setUser(null);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
