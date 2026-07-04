const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}
