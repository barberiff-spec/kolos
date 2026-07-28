"use client";

import { useEffect, useState } from "react";
import { KolosLogo } from "@/components/KolosLogo";

const SESSION_KEY = "kolos-splash-shown";
const WORDMARK_DELAY_MS = 1300; // after the logo finishes drawing itself
const WORDMARK_FADE_MS = 400;
const HOLD_MS = 700; // pause once the wordmark is fully visible
const FADE_MS = 500;
const EXIT_MS = WORDMARK_DELAY_MS + WORDMARK_FADE_MS + HOLD_MS;
const UNMOUNT_MS = EXIT_MS + FADE_MS;

export function Splash() {
  const [mounted, setMounted] = useState(false);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setMounted(true);

    const wordmarkTimer = setTimeout(() => setWordmarkVisible(true), WORDMARK_DELAY_MS);
    const exitTimer = setTimeout(() => setExiting(true), EXIT_MS);
    const unmountTimer = setTimeout(() => setMounted(false), UNMOUNT_MS);

    return () => {
      clearTimeout(wordmarkTimer);
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
          background: "radial-gradient(ellipse 60% 45% at 50% 45%, rgb(var(--text) / 0.05), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center">
        <KolosLogo size={96} className="text-text" animate />
        <span
          className="mt-10 lowercase text-muted transition-opacity ease-out"
          style={{
            fontWeight: 400,
            fontSize: 44,
            letterSpacing: "0.02em",
            transitionDuration: `${WORDMARK_FADE_MS}ms`,
            opacity: wordmarkVisible ? 1 : 0,
          }}
        >
          kolos
        </span>
      </div>
    </div>
  );
}
