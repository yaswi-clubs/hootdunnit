"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SYNC_EVENT = "persuado:storage";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked (private mode) - the app keeps working in memory */
  }
  window.dispatchEvent(new CustomEvent<{ key: string }>(SYNC_EVENT, { detail: { key } }));
}

/**
 * LocalStorage-backed state. Renders `initial` on the server and first client
 * paint (no hydration mismatch), then loads the stored value. Every hook using
 * the same key stays in sync, including across browser tabs.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const initialRef = useRef(initial);
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const valueRef = useRef<T>(initial);
  valueRef.current = value;

  useEffect(() => {
    setValue(readStorage(key, initialRef.current));
    setHydrated(true);

    const sync = (event: Event) => {
      const changedKey =
        event instanceof StorageEvent ? event.key : (event as CustomEvent<{ key: string }>).detail?.key;
      if (changedKey === key) setValue(readStorage(key, initialRef.current));
    };
    window.addEventListener("storage", sync);
    window.addEventListener(SYNC_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SYNC_EVENT, sync);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const base = readStorage(key, valueRef.current);
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(base) : next;
      valueRef.current = resolved;
      setValue(resolved);
      writeStorage(key, resolved);
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
