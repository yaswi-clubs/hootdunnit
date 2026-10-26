"use client";

import { useCallback, useMemo } from "react";
import type { CaseState, GameId, Hunch, HistoryItem, Progress, StepId } from "./types";
import { useLocalStorage } from "./storage";
import { uid } from "./uid";

export const PROGRESS_KEY = "persuado:v2:progress";
export const POINTS_PER_RANK = 100;
const HISTORY_LIMIT = 40;

export const STEP_POINTS: Record<StepId, number> = { sort: 10, fact: 10, strong: 10, hoot: 30, report: 50 };
/** Extra points per star in a warm-up game. */
export const STAR_POINTS = 5;

export const DEFAULT_PROGRESS: Progress = {
  points: 0,
  streak: 0,
  lastActiveDay: null,
  cases: {},
  history: [],
  hootChats: 0,
};

export const EMPTY_CASE: CaseState = { games: {}, hoot: false };

export const RANKS = ["Junior Sleuth", "Clue Spotter", "Puzzle Solver", "Case Cracker", "Super Sleuth", "Master Detective"];

export function rankFor(points: number) {
  const level = Math.floor(points / POINTS_PER_RANK) + 1;
  const into = points % POINTS_PER_RANK;
  const title = RANKS[Math.min(level - 1, RANKS.length - 1)];
  const next = level < RANKS.length ? RANKS[level] : null;
  return { level, into, needed: POINTS_PER_RANK, title, next };
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

export function normaliseProgress(stored: Partial<Progress> | null | undefined): Progress {
  const p = { ...DEFAULT_PROGRESS, ...(stored ?? {}) };
  return {
    ...p,
    cases: p.cases && typeof p.cases === "object" ? p.cases : {},
    history: Array.isArray(p.history) ? p.history : [],
    hootChats: typeof p.hootChats === "number" ? p.hootChats : 0,
  };
}

export function caseState(progress: Progress, caseId: string): CaseState {
  const s = progress.cases[caseId];
  return s ? { ...EMPTY_CASE, ...s, games: { ...(s.games ?? {}) } } : { ...EMPTY_CASE, games: {} };
}

/** Steps done for a case, out of 5 (3 warm-ups, Hoot, report). */
export function stepsDone(state: CaseState): number {
  return Object.keys(state.games).length + (state.hoot ? 1 : 0) + (state.report ? 1 : 0);
}

export const GAME_IDS: GameId[] = ["sort", "fact", "strong"];

export function isGame(step: StepId): step is GameId {
  return step === "sort" || step === "fact" || step === "strong";
}

export function starsFor(mistakes: number): number {
  if (mistakes <= 1) return 3;
  if (mistakes <= 3) return 2;
  return 1;
}

export interface RecordInput {
  caseId: string;
  step: StepId;
  summary: string;
  stars?: number;
  hunch?: Hunch;
  report?: string;
  kindNod?: boolean;
}

export function useProgress() {
  const [stored, setStored, hydrated] = useLocalStorage<Progress>(PROGRESS_KEY, DEFAULT_PROGRESS);
  const progress = useMemo(() => normaliseProgress(stored), [stored]);

  /** Days in a row only count if she played today or yesterday. */
  const streak = useMemo(() => {
    if (!progress.lastActiveDay) return 0;
    return daysBetween(progress.lastActiveDay, dayKey()) <= 1 ? progress.streak : 0;
  }, [progress]);

  const solvedCount = useMemo(() => Object.values(progress.cases).filter((c) => c.solvedAt).length, [progress]);

  const record = useCallback(
    (input: RecordInput): number => {
      const stars = input.stars ?? 0;
      const earned = STEP_POINTS[input.step] + (isGame(input.step) ? stars * STAR_POINTS : 0);
      setStored((prevRaw) => {
        const prev = normaliseProgress(prevRaw);
        const today = dayKey();
        let nextStreak = prev.streak;
        if (prev.lastActiveDay !== today) {
          nextStreak = prev.lastActiveDay && daysBetween(prev.lastActiveDay, today) === 1 ? prev.streak + 1 : 1;
        }

        const state = caseState(prev, input.caseId);
        if (isGame(input.step)) {
          state.games[input.step] = Math.max(state.games[input.step] ?? 0, stars);
        }
        if (input.step === "hoot") {
          state.hoot = true;
          if (input.hunch) state.hunch = input.hunch;
        }
        if (input.step === "report") {
          state.report = input.report;
          state.kindNod = state.kindNod || Boolean(input.kindNod);
          state.solvedAt = state.solvedAt ?? Date.now();
        }

        const item: HistoryItem = {
          id: uid(),
          caseId: input.caseId,
          step: input.step,
          summary: input.summary,
          createdAt: Date.now(),
          points: earned,
        };
        return {
          points: prev.points + earned,
          streak: nextStreak,
          lastActiveDay: today,
          cases: { ...prev.cases, [input.caseId]: state },
          history: [item, ...prev.history].slice(0, HISTORY_LIMIT),
          hootChats: prev.hootChats + (input.step === "hoot" ? 1 : 0),
        };
      });
      return earned;
    },
    [setStored],
  );

  const reset = useCallback(() => setStored(DEFAULT_PROGRESS), [setStored]);

  return { progress, streak, solvedCount, record, reset, hydrated };
}
