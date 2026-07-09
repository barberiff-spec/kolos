"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(max-width: 768px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function getServerSnapshot() {
  return false;
}

/** True on phones/tablets — skip heavy animations that freeze mobile Safari. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
