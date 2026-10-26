"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { Case } from "@/lib/data";
import { GAME_LIST, GAMES } from "@/lib/games";
import { caseState, useProgress } from "@/lib/progress";
import { caseHref } from "@/lib/useCase";
import type { GameId } from "@/lib/types";
import { Button, Card, HootSays, Pill, Stars } from "@/components/ui";

const CHEERS: Record<number, string[]> = {
  3: ["Super sleuthing! You spotted every clue.", "Wow, a perfect case! Hoot is doing a happy dance."],
  2: ["Great detective work! Just a couple of tricky ones.", "Nicely done! Your clue-spotting is getting sharper."],
  1: ["You finished it, and every try teaches you something. Want another go?", "Good effort, detective! Those were tricky clues."],
};

export default function GameResult({
  c,
  game,
  stars,
  points,
  onReplay,
}: {
  c: Case;
  game: GameId;
  stars: number;
  points: number;
  onReplay: () => void;
}) {
  const { progress } = useProgress();
  const state = caseState(progress, c.id);
  const nextGame = GAME_LIST.find((g) => g.id !== game && !state.games[g.id]);
  const cheer = CHEERS[stars][c.id.length % CHEERS[stars].length];

  return (
    <div className="space-y-4">
      <Card className="space-y-3 text-center motion-safe:animate-pop">
        <p className="text-5xl" aria-hidden="true">
          {GAMES[game].emoji}
        </p>
        <h2 className="font-display text-3xl font-black">{GAMES[game].name} done!</h2>
        <div className="flex justify-center">
          <Stars value={stars} size="h-10 w-10" />
        </div>
        <Pill className="bg-sun text-plum">+{points} detective points</Pill>
      </Card>
      <HootSays>{cheer}</HootSays>
      <div className="grid gap-2">
        {nextGame ? (
          <Link
            href={caseHref("/arena/", c.id, { game: nextGame.id })}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-plum font-display font-bold text-white shadow-plum transition active:translate-y-[3px] active:shadow-none"
          >
            Next: {nextGame.name} <ArrowRight className="h-5 w-5" />
          </Link>
        ) : (
          <Link
            href={caseHref("/case/", c.id)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf font-display font-bold text-white shadow-leaf transition active:translate-y-[3px] active:shadow-none"
          >
            Back to the case file <ArrowRight className="h-5 w-5" />
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" /> Play again
          </Button>
          <Link
            href={caseHref("/case/", c.id)}
            className="flex h-12 items-center justify-center rounded-2xl border-2 border-plum/10 bg-white font-display font-bold"
          >
            Case file
          </Link>
        </div>
      </div>
    </div>
  );
}
