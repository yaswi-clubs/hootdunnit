import type { CategoryId, ViewKey } from "./data";

export type GameId = "sort" | "fact" | "strong";
export type StepId = GameId | "hoot" | "report";
export type Hunch = ViewKey | "both";

export interface CaseState {
  /** Best stars (1-3) per warm-up game. */
  games: Partial<Record<GameId, number>>;
  hoot: boolean;
  hunch?: Hunch;
  report?: string;
  kindNod?: boolean;
  solvedAt?: number;
}

export interface HistoryItem {
  id: string;
  caseId: string;
  step: StepId;
  summary: string;
  createdAt: number;
  points: number;
}

export interface Progress {
  points: number;
  streak: number;
  lastActiveDay: string | null;
  cases: Record<string, CaseState>;
  history: HistoryItem[];
  hootChats: number;
}

export interface Settings {
  sound: boolean;
  categories: CategoryId[];
  name: string;
  onboarded: boolean;
}

export type ChatRole = "you" | "hoot";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}
