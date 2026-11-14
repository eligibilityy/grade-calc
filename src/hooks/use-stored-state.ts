"use client";

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

const listeners = new Set<() => void>();
const memory = new Map<string, string>();

function subscribe(listener: () => void) {
  listeners.add(listener);
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
  } catch {}
  listeners.forEach((listener) => listener());
}

function parse<T>(
  raw: string | null,
  isValid: (value: unknown) => value is T,
): T | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function useStoredState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(
    () => parse(raw, isValid) ?? initial,
    [raw, isValid, initial],
  );

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      const prev = parse(read(key), isValid) ?? initial;
      const next =
        typeof action === "function"
          ? (action as (prev: T) => T)(prev)
          : action;
      write(key, JSON.stringify(next));
    },
    [key, isValid, initial],
  );

  return [value, setValue];
}
