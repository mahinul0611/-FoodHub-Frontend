"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, unwrap } from "./api";
import { authClient } from "./auth-client";
import type { AppUser } from "./types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  refresh: () => Promise<AppUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => null,
  signOut: async () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<AppUser | null> => {
    try {
      const payload = await api.get("/me");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = unwrap<any>(payload);
      const me: AppUser | null =
        raw && typeof raw === "object"
          ? raw.user && typeof raw.user === "object"
            ? (raw.user as AppUser)
            : (raw as AppUser)
          : null;
      const nextUser = me && (me.id || me.email) ? me : null;
      setUser(nextUser);
      return nextUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {
      // Even if the network call fails, clear the local session state.
    }
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
