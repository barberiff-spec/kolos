"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    // Never block first paint — auth is best-effort after render.
    const t = window.setTimeout(() => {
      void fetchUser();
    }, 0);
    return () => window.clearTimeout(t);
  }, [fetchUser]);

  return <>{children}</>;
}
