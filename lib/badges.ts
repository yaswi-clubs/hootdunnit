import { getCase } from "./data";
import type { Progress } from "./types";

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  how: string;
  earned: (p: Progress, streak: number) => boolean;
}

const solved = (p: Progress) => Object.values(p.cases).filter((c) => c.solvedAt);
const anyStars = (p: Progress, game: "sort" | "fact" | "strong") => Object.values(p.cases).some((c) => (c.games?.[game] ?? 0) >= 3);

export const BADGES: Badge[] = [
  { id: "first-clue", emoji: "🔎", name: "First Clue", how: "Play any game", earned: (p) => p.history.length > 0 },
  { id: "first-case", emoji: "📁", name: "Case Cracked", how: "Solve your first case", earned: (p) => solved(p).length >= 1 },
  { id: "sorter", emoji: "🗂️", name: "Super Sorter", how: "Get 3 stars in Clue Sort", earned: (p) => anyStars(p, "sort") },
  { id: "fact-finder", emoji: "🔬", name: "Fact Finder", how: "Get 3 stars in Fact or Feeling", earned: (p) => anyStars(p, "fact") },
  { id: "rock-solid", emoji: "🪨", name: "Rock Solid", how: "Get 3 stars in Strong or Wobbly", earned: (p) => anyStars(p, "strong") },
  { id: "kind", emoji: "💛", name: "Kind Detective", how: "Give a kind nod to the other idea in a report", earned: (p) => Object.values(p.cases).some((c) => c.kindNod) },
  { id: "hoot-pal", emoji: "🦉", name: "Hoot's Best Pal", how: "Chat with Hoot 3 times", earned: (p) => p.hootChats >= 3 },
  { id: "streak-3", emoji: "📅", name: "Three in a Row", how: "Play 3 days in a row", earned: (_p, streak) => streak >= 3 },
  {
    id: "explorer",
    emoji: "🧭",
    name: "Explorer",
    how: "Solve cases in 3 different categories",
    earned: (p) => new Set(Object.keys(p.cases).filter((id) => p.cases[id].solvedAt).map((id) => getCase(id)?.category)).size >= 3,
  },
  { id: "five-cases", emoji: "🌟", name: "Star Detective", how: "Solve 5 cases", earned: (p) => solved(p).length >= 5 },
];

export function earnedBadges(p: Progress, streak: number): Badge[] {
  return BADGES.filter((b) => b.earned(p, streak));
}
