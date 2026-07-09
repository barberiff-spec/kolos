import { create } from "zustand";
import api, { setAccessToken } from "@/lib/api";
import type { AuthResponse, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      // Prefer refresh first when we have no in-memory session yet —
      // cookies may work after SameSite=None fix; Bearer is restored from sessionStorage.
      const { data } = await api.get<User>("/auth/me", { timeout: 10000 });
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    setAccessToken(data.access_token);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  register: async (email, password, fullName) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    setAccessToken(data.access_token);
    set({ user: data.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
