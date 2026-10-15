export type Side = "for" | "against";

export type ActivityKind = "arena" | "peel" | "spar";

export interface HistoryItem {
  id: string;
  kind: ActivityKind;
  topic: string;
  summary: string;
  createdAt: number;
  xp: number;
}

export interface Progress {
  xp: number;
  streak: number;
  lastActiveDay: string | null;
  counts: Record<ActivityKind, number>;
  history: HistoryItem[];
}

export interface Settings {
  sound: boolean;
}

export type ChatRole = "user" | "coach";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  assumption?: string;
}
