import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/api-config";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "kolos_access_token";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore quota / private mode
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  accessToken = readStoredToken();
  return accessToken;
}

// Restore token ASAP on client so first /auth/me can use Bearer.
if (typeof window !== "undefined") {
  accessToken = readStoredToken();
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (!original) return Promise.reject(error);

    const url = original.url || "";
    const skipRefresh =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");

    if (error.response?.status === 401 && !original._retry && !skipRefresh) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = api
          .post<{ access_token: string }>("/auth/refresh")
          .then((res) => {
            const token = res.data.access_token;
            setAccessToken(token);
            return token;
          })
          .catch(() => {
            setAccessToken(null);
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
