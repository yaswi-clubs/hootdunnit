"use client";

import { useCallback, useMemo } from "react";
import type { ActivityKind, HistoryItem, Progress } from "./types";
import { useLocalStorage } from "./storage";
import { uid } from "./uid";

export const PROGRESS_KEY = "persuado:progress";
export const XP_PER_LEVEL = 100;
export const XP_REWARDS: Record<ActivityKind, number> = { arena: 30, peel: 40, spar: 50 };
const HISTORY_LIMIT = 30;

export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  streak: 0,
  lastActiveDay: null,
  counts: { arena: 0, peel: 0, spar: 0 },
  history: [],
};

export const LEVEL_TITLES = ["Rookie", "Debater", "Persuader", "Challenger", "Orator", "Champion"];

export function levelFor(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, into, needed: XP_PER_LEVEL, title };
}

export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

function normalise(stored: Partial<Progress> | null | undefined): Progress {
  return {
    ...DEFAULT_PROGRESS,
    ...(stored ?? {}),
    counts: { ...DEFAULT_PROGRESS.counts, ...(stored?.counts ?? {}) },
    history: Array.isArray(stored?.history) ? stored.history : [],
  };
}

export function useProgress() {
  const [stored, setStored, hydrated] = useLocalStorage<Progress>(PROGRESS_KEY, DEFAULT_PROGRESS);
  const progress = useMemo(() => normalise(stored), [stored]);

  /** Streak only counts if the learner practised today or yesterday. */
  const streak = useMemo(() => {
    if (!progress.lastActiveDay) return 0;
    return daysBetween(progress.lastActiveDay, dayKey()) <= 1 ? progress.streak : 0;
  }, [progress]);

  const record = useCallback(
    (kind: ActivityKind, topic: string, summary: string): number => {
      const earned = XP_REWARDS[kind];
      setStored((prevRaw) => {
        const prev = normalise(prevRaw);
        const today = dayKey();
        let nextStreak = prev.streak;
        if (prev.lastActiveDay !== today) {
          nextStreak = prev.lastActiveDay && daysBetween(prev.lastActiveDay, today) === 1 ? prev.streak + 1 : 1;
        }
        const item: HistoryItem = { id: uid(), kind, topic, summary, createdAt: Date.now(), xp: earned };
        return {
          xp: prev.xp + earned,
          streak: nextStreak,
          lastActiveDay: today,
          counts: { ...prev.counts, [kind]: prev.counts[kind] + 1 },
          history: [item, ...prev.history].slice(0, HISTORY_LIMIT),
        };
      });
      return earned;
    },
    [setStored],
  );

  const reset = useCallback(() => setStored(DEFAULT_PROGRESS), [setStored]);

  return { progress, streak, record, reset, hydrated };
}
