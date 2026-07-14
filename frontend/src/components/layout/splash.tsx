"use client";

import { useEffect, useState } from "react";
import { KolosLogo } from "@/components/KolosLogo";

const SESSION_KEY = "kolos-splash-shown";
const HOLD_MS = 700;
const FADE_MS = 500;

export function Splash() {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setMounted(true);

    const enterFrame = requestAnimationFrame(() => setEntered(true));
    const exitTimer = setTimeout(() => setExiting(true), HOLD_MS);
    const unmountTimer = setTimeout(() => setMounted(false), HOLD_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg transition-opacity"
      style={{ transitionDuration: `${FADE_MS}ms`, opacity: exiting ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 45%, rgb(var(--accent) / 0.08), transparent 60%)",
        }}
      />
      <div
        className="relative flex flex-col items-center transition-all ease-out"
        style={{
          transitionDuration: `${FADE_MS}ms`,
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(0.96)",
        }}
      >
        <KolosLogo size={96} className="text-accent" />
        <span
          className="mt-10 lowercase text-muted"
          style={{ fontWeight: 400, fontSize: 44, letterSpacing: "0.02em" }}
        >
          kolos
        </span>
      </div>
    </div>
  );
}
