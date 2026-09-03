"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, cb: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => subscribe(query, cb),
    () => getSnapshot(query),
    () => false
  );
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}
