import type { GameId } from "./types";

export interface GameInfo {
  id: GameId;
  name: string;
  emoji: string;
  blurb: string;
  how: string;
}

export const GAMES: Record<GameId, GameInfo> = {
  sort: {
    id: "sort",
    name: "Clue Sort",
    emoji: "🗂️",
    blurb: "Whose clue is it? Sort each one to the right friend.",
    how: "Read each clue card, then tap the friend it helps.",
  },
  fact: {
    id: "fact",
    name: "Fact or Feeling?",
    emoji: "🔬",
    blurb: "Can you check it, or is it how someone feels?",
    how: "A fact is something you could check. A feeling is what someone thinks or feels. Both are useful clues!",
  },
  strong: {
    id: "strong",
    name: "Strong or Wobbly?",
    emoji: "🪨",
    blurb: "Spot the clue that gives a real reason.",
    how: "Two clues, one case. Tap the strong one: it gives a reason you could picture or check.",
  },
};

export const GAME_LIST = Object.values(GAMES);
