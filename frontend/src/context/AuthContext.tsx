"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/types/user";
import type { AuthResponse } from "@/types/auth";
import apiClient from "@/lib/axios";

// Keys already read/written by lib/axios.ts's interceptors — do NOT rename
// these without updating that file too (see memory.md §3.2).
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_NAME_KEY = "userName";
// New key, only read/written by this context, to persist the full user
// object (id/email/role) across reloads. `userName` alone isn't enough to
// hydrate `user`/`isAuthenticated` correctly.
const USER_KEY = "user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazily hydrate from localStorage. The lazy initializer only runs once,
  // on the client's first render of this component (client components still
  // get an initial SSR pass where `window` is undefined and this correctly
  // returns null, then run again during client hydration where `window` is
  // defined) — so by the time any consumer reads `user`, hydration is
  // already complete and `isLoading` can start (and stay) false. No effect
  // is needed to "finish" hydration asynchronously.
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading] = useState(false);

  const login = useCallback((auth: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(USER_NAME_KEY, auth.user.name);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    // Best-effort notify the backend so the Session doc is invalidated
    // server-side (memory.md §2.6). Fire-and-forget: logout must succeed
    // client-side regardless of whether this call succeeds, matching the
    // previous Navbar behavior (`.catch(() => {})`).
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      apiClient.post("/logout", { refreshToken }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      if (partial.name) localStorage.setItem(USER_NAME_KEY, partial.name);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
