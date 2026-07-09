const PRODUCTION_API = "https://kolos-api-barber-spec.amvera.io/api/v1";
const LOCAL_API = "http://localhost:8001/api/v1";

/** API base URL — production fallback when env var is missing on Vercel. */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PRODUCTION_API;
  return LOCAL_API;
}

export const API_URL = getApiUrl();
