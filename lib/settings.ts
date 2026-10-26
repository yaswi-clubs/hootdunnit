"use client";

import { DEFAULT_CATEGORIES } from "./data";
import { useLocalStorage } from "./storage";
import type { Settings } from "./types";

export const SETTINGS_KEY = "persuado:v2:settings";
export const DEFAULT_SETTINGS: Settings = { sound: true, categories: DEFAULT_CATEGORIES, name: "", onboarded: false };

export function normaliseSettings(stored: Partial<Settings> | null | undefined): Settings {
  const merged = { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  return {
    ...merged,
    categories: Array.isArray(merged.categories) && merged.categories.length ? merged.categories : DEFAULT_CATEGORIES,
    name: typeof merged.name === "string" ? merged.name.slice(0, 20) : "",
  };
}

export function useSettings() {
  const [stored, setStored, hydrated] = useLocalStorage<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const settings = normaliseSettings(stored);
  const update = (patch: Partial<Settings>) => setStored((prev) => ({ ...normaliseSettings(prev), ...patch }));
  return { settings, update, hydrated };
}

export function detectiveName(settings: Settings): string {
  return settings.name.trim() ? `Detective ${settings.name.trim()}` : "Detective";
}
