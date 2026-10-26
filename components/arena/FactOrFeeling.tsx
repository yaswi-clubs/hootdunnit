"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CAST } from "@/lib/cast";
import { shuffle, type Case, type ClueKind } from "@/lib/data";
import { playDing, playHmm } from "@/lib/sound";
import { Avatar, Button } from "@/components/ui";
import { GameProgress } from "./GameProgress";

const RIGHT: Record<ClueKind, string> = {
  fact: "Yes, a fact! You could look that up or test it.",
  feeling: "Yes, a feeling! Someone else might feel differently, and that's OK. Feelings are clues too.",
};

const HINT: Record<ClueKind, string> = {
  fact: "Hmm, could you check this in a book or with an expert? Try again!",
  feeling: "Hmm, could two people disagree about this? Try again!",
};

export default function FactOrFeeling({ c, onDone }: { c: Case; onDone: (mistakes: number) => void }) {
  const deck = useMemo(() => shuffle(c.clues), [c]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [wobble, setWobble] = useState(0);

  const clue = deck[index];
  if (!clue) return null;
  const view = clue.view;
  const who = CAST[c.views[view].who];

  const choose = (kind: ClueKind) => {
    if (solved) return;
    if (kind === clue.kind) {
      playDing();
      setSolved(true);
      setFeedback({ ok: true, text: RIGHT[clue.kind] });
    } else {
      playHmm();
      setMistakes((m) => m + 1);
      setWobble((w) => w + 1);
      setFeedback({ ok: false, text: HINT[clue.kind] });
    }
  };

  const next = () => {
    setSolved(false);
    setFeedback(null);
    if (index + 1 >= deck.length) onDone(mistakes);
    else setIndex(index + 1);
  };

  return (
    <div className="space-y-4">
      <GameProgress index={index} total={deck.length} />

      <div
        key={`${index}-${wobble}`}
        className={`space-y-3 rounded-2xl bg-white p-5 shadow-soft ${wobble && feedback && !feedback.ok ? "motion-safe:animate-wobble" : "motion-safe:animate-pop"}`}
      >
        <div className="flex items-center gap-2">
          <Avatar who={who.id} view={view} size="sm" />
          <span className="text-sm font-bold text-plum-soft">{who.name} says…</span>
        </div>
        <p className="font-display text-xl font-bold leading-snug">“{clue.text}”</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => choose("fact")}
          disabled={solved}
          className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-4 transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${solved && clue.kind === "fact" ? "border-leaf bg-leaf/10" : "border-iris bg-white"}`}
        >
          <span className="text-4xl" aria-hidden="true">
            🔍
          </span>
          <span className="font-display text-xl font-extrabold">Fact</span>
          <span className="text-xs text-plum-soft">You could check it</span>
        </button>
        <button
          type="button"
          onClick={() => choose("feeling")}
          disabled={solved}
          className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-4 transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${solved && clue.kind === "feeling" ? "border-leaf bg-leaf/10" : "border-tang bg-white"}`}
        >
          <span className="text-4xl" aria-hidden="true">
            💭
          </span>
          <span className="font-display text-xl font-extrabold">Feeling</span>
          <span className="text-xs text-plum-soft">What someone thinks</span>
        </button>
      </div>

      <div className="min-h-[3rem] space-y-3" aria-live="polite">
        {feedback && (
          <p className={`rounded-xl px-4 py-3 text-center font-bold motion-safe:animate-pop ${feedback.ok ? "bg-leaf/15 text-leaf-dark" : "bg-sun/30"}`}>
            {feedback.text}
          </p>
        )}
        {solved && (
          <Button className="w-full" onClick={next}>
            {index + 1 >= deck.length ? "See my stars" : "Next clue"} <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
