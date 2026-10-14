"use client";

import { useCallback, useMemo, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";

// A tiny store around localStorage. useSyncExternalStore (below) is React's
// way to read from something outside React and re-render when it changes.

const listeners = new Set<() => void>();
// In-memory copy, so the app still works when localStorage is blocked or full.
const memory = new Map<string, string>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Fires when another tab changes localStorage; drop our stale copy.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null) memory.delete(e.key);
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or quota exceeded: keep the in-memory copy only.
  }
  listeners.forEach((listener) => listener());
}

function parse<T>(raw: string | null, isValid: (value: unknown) => value is T): T | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Like useState, but saved to localStorage so it survives a refresh.
 *
 * On the server (and during hydration) there is no localStorage, so
 * `getServerSnapshot` returns null and `initial` is used; React then
 * re-renders with the saved value. `isValid` rejects saved data that no
 * longer matches the expected shape. Pass a constant for `initial`.
 */
export function useStoredState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  // The snapshot is the raw string: strings compare by value, so React only
  // re-renders when the saved data actually changes.
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(() => parse(raw, isValid) ?? initial, [raw, isValid, initial]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      const prev = parse(read(key), isValid) ?? initial;
      const next = typeof action === "function" ? (action as (prev: T) => T)(prev) : action;
      write(key, JSON.stringify(next));
    },
    [key, isValid, initial],
  );

  return [value, setValue];
}
