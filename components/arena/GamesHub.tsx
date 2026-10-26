"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Shuffle } from "lucide-react";
import { randomCase, type Case } from "@/lib/data";
import { GAMES, GAME_LIST } from "@/lib/games";
import { caseState, starsFor, useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { celebrate } from "@/lib/celebrate";
import { playChime } from "@/lib/sound";
import { caseHref, useCaseParam } from "@/lib/useCase";
import type { GameId } from "@/lib/types";
import { Button, Card, HootSays, Stars } from "@/components/ui";
import ClueSort from "./ClueSort";
import FactOrFeeling from "./FactOrFeeling";
import StrongOrWobbly from "./StrongOrWobbly";
import GameResult from "./GameResult";

const isGameId = (g: string | null): g is GameId => g === "sort" || g === "fact" || g === "strong";

export default function GamesHub() {
  const c = useCaseParam();
  const params = useSearchParams();
  const game = params.get("game");

  if (!c) return <div className="h-64" aria-busy="true" />;
  if (isGameId(game)) return <GamePlayer key={`${c.id}-${game}`} c={c} game={game} />;
  return <GameMenu c={c} />;
}

function GameMenu({ c }: { c: Case }) {
  const router = useRouter();
  const { progress } = useProgress();
  const { settings } = useSettings();
  const state = caseState(progress, c.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black leading-tight">Clue Games</h1>
        <p className="text-plum-soft">Quick warm-ups to sharpen your detective eyes.</p>
      </div>

      <Card className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-peach text-2xl" aria-hidden="true">
          {c.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-plum-soft">Playing with clues from</p>
          <Link href={caseHref("/case/", c.id)} className="font-display font-extrabold leading-tight underline-offset-2 hover:underline">
            {c.title}
          </Link>
        </div>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Pick a different case"
          onClick={() => router.push(caseHref("/arena/", randomCase(settings.categories, c.id).id))}
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </Card>

      <div className="space-y-3">
        {GAME_LIST.map((g) => (
          <Link
            key={g.id}
            href={caseHref("/arena/", c.id, { game: g.id })}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-peach text-4xl" aria-hidden="true">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-lg font-extrabold">{g.name}</span>
              <span className="block text-sm text-plum-soft">{g.blurb}</span>
            </span>
            {state.games[g.id] ? <Stars value={state.games[g.id] ?? 0} size="h-4 w-4" /> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

function GamePlayer({ c, game }: { c: Case; game: GameId }) {
  const { record } = useProgress();
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ stars: number; points: number } | null>(null);
  const [started, setStarted] = useState(false);
  const info = GAMES[game];

  const finish = (mistakes: number) => {
    const stars = starsFor(mistakes);
    const points = record({ caseId: c.id, step: game, stars, summary: `${info.name}: ${stars} star${stars > 1 ? "s" : ""}` });
    if (stars === 3) celebrate();
    else playChime();
    setResult({ stars, points });
  };

  const Game = game === "sort" ? ClueSort : game === "fact" ? FactOrFeeling : StrongOrWobbly;

  return (
    <div className="space-y-4">
      <Link href={caseHref("/case/", c.id)} className="inline-flex items-center gap-1 text-sm font-bold text-plum-soft">
        <ChevronLeft className="h-4 w-4" /> {c.title}
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">
          {info.emoji}
        </span>
        <div>
          <h1 className="font-display text-2xl font-black leading-tight">{info.name}</h1>
          <p className="text-sm text-plum-soft">{c.question}</p>
        </div>
      </div>

      {result ? (
        <GameResult
          c={c}
          game={game}
          stars={result.stars}
          points={result.points}
          onReplay={() => {
            setResult(null);
            setRound((r) => r + 1);
          }}
        />
      ) : started ? (
        <Game key={round} c={c} onDone={finish} />
      ) : (
        <div className="space-y-4 motion-safe:animate-pop">
          <HootSays>{info.how}</HootSays>
          <Button size="lg" className="w-full" onClick={() => setStarted(true)}>
            Let&apos;s go!
          </Button>
        </div>
      )}
    </div>
  );
}
