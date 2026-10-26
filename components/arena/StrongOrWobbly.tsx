"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CAST } from "@/lib/cast";
import { shuffle, WOBBLY_CLUES, type Case } from "@/lib/data";
import { playDing, playHmm } from "@/lib/sound";
import { Avatar, Button } from "@/components/ui";
import { GameProgress } from "./GameProgress";

const ROUNDS = 5;

interface Round {
  view: "a" | "b";
  options: { text: string; strong: boolean }[];
}

function buildRounds(c: Case): Round[] {
  const strong = shuffle(c.clues).slice(0, ROUNDS);
  const wobbly = shuffle(WOBBLY_CLUES);
  return strong.map((clue, i) => ({
    view: clue.view,
    options: shuffle([
      { text: clue.text, strong: true },
      { text: wobbly[i % wobbly.length], strong: false },
    ]),
  }));
}

export default function StrongOrWobbly({ c, onDone }: { c: Case; onDone: (mistakes: number) => void }) {
  const rounds = useMemo(() => buildRounds(c), [c]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<number | null>(null);

  const round = rounds[index];
  if (!round) return null;
  const w = CAST[c.views[round.view].who];
  const solved = picked !== null;

  const choose = (i: number) => {
    if (solved) return;
    if (round.options[i].strong) {
      playDing();
      setPicked(i);
    } else {
      playHmm();
      setMistakes((m) => m + 1);
      setWrongPick(i);
    }
  };

  const next = () => {
    setPicked(null);
    setWrongPick(null);
    if (index + 1 >= rounds.length) onDone(mistakes);
    else setIndex(index + 1);
  };

  return (
    <div className="space-y-4">
      <GameProgress index={index} total={rounds.length} />

      <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
        <Avatar who={w.id} view={round.view} />
        <p className="text-[15px] leading-snug">
          <strong>{w.name}</strong> needs a strong clue for <strong>“{c.views[round.view].stance}”</strong>. Which one should go in the case file?
        </p>
      </div>

      <div className="grid gap-3">
        {round.options.map((opt, i) => {
          const isRight = solved && opt.strong;
          const isWrong = wrongPick === i && !solved;
          return (
            <button
              key={`${index}-${i}`}
              type="button"
              onClick={() => choose(i)}
              disabled={solved || wrongPick === i}
              className={`rounded-2xl border-4 bg-white p-4 text-left font-display text-lg font-bold leading-snug transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${
                isRight ? "border-leaf bg-leaf/10" : isWrong ? "border-sun opacity-60 motion-safe:animate-wobble" : "border-plum/10"
              }`}
            >
              <span className="mr-2" aria-hidden="true">
                {isRight ? "🪨" : isWrong ? "🍮" : "🔎"}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      <div className="min-h-[3rem] space-y-3" aria-live="polite">
        {solved ? (
          <>
            <p className="rounded-xl bg-leaf/15 px-4 py-3 text-center font-bold text-leaf-dark motion-safe:animate-pop">
              Rock solid! That clue gives a real reason you could picture or check.
            </p>
            <Button className="w-full" onClick={next}>
              {index + 1 >= rounds.length ? "See my stars" : "Next pair"} <ArrowRight className="h-5 w-5" />
            </Button>
          </>
        ) : wrongPick !== null ? (
          <p className="rounded-xl bg-sun/30 px-4 py-3 text-center font-bold motion-safe:animate-pop">
            That one&apos;s a bit wobbly, like a jelly! It doesn&apos;t say <em>why</em>. Try the other one.
          </p>
        ) : null}
      </div>
    </div>
  );
}
