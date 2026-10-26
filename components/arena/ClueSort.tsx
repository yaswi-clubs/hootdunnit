"use client";

import { useMemo, useState } from "react";
import { CAST } from "@/lib/cast";
import { shuffle, type Case, type ViewKey } from "@/lib/data";
import { playDing, playHmm } from "@/lib/sound";
import { Avatar, VIEW_TONE } from "@/components/ui";
import { GameProgress } from "./GameProgress";

/** Sort each clue to the friend it helps. Wrong taps just wobble and let her try again. */
export default function ClueSort({ c, onDone }: { c: Case; onDone: (mistakes: number) => void }) {
  const deck = useMemo(() => shuffle(c.clues), [c]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [sorted, setSorted] = useState<Record<ViewKey, string[]>>({ a: [], b: [] });
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [wobble, setWobble] = useState(0);
  const [busy, setBusy] = useState(false);

  const clue = deck[index];

  const choose = (view: ViewKey) => {
    if (busy || !clue) return;
    const name = CAST[c.views[view].who].name;
    if (view === clue.view) {
      playDing();
      setBusy(true);
      setFeedback({ ok: true, text: `Yes! That clue helps ${name}.` });
      setSorted((s) => ({ ...s, [view]: [...s[view], clue.text] }));
      window.setTimeout(() => {
        setFeedback(null);
        setBusy(false);
        if (index + 1 >= deck.length) onDone(mistakes);
        else setIndex(index + 1);
      }, 900);
    } else {
      playHmm();
      setMistakes((m) => m + 1);
      setWobble((w) => w + 1);
      setFeedback({ ok: false, text: `Hmm, would ${name} say that? Have another look.` });
    }
  };

  if (!clue) return null;

  return (
    <div className="space-y-4">
      <GameProgress index={index} total={deck.length} />

      <div
        key={`${index}-${wobble}`}
        className={`relative rounded-2xl border-2 border-dashed border-plum/20 bg-white p-5 text-center shadow-soft ${wobble && feedback && !feedback.ok ? "motion-safe:animate-wobble" : "motion-safe:animate-pop"}`}
      >
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sun px-3 py-0.5 text-xs font-black uppercase tracking-wider">Clue</span>
        <p className="font-display text-xl font-bold leading-snug">{clue.text}</p>
      </div>

      <p className="text-center text-sm font-bold text-plum-soft">Whose clue is this?</p>

      <div className="grid grid-cols-2 gap-3">
        {(["a", "b"] as const).map((v) => {
          const w = CAST[c.views[v].who];
          return (
            <button
              key={v}
              type="button"
              onClick={() => choose(v)}
              disabled={busy}
              className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-white p-3 transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${VIEW_TONE[v].border}`}
            >
              <Avatar who={w.id} view={v} size="lg" />
              <span className="font-display text-lg font-extrabold">{w.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${VIEW_TONE[v].bg}`}>{c.views[v].stance}</span>
              <span className="text-[11px] font-bold text-plum-soft">{sorted[v].length} {sorted[v].length === 1 ? "clue" : "clues"}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[3rem]" aria-live="polite">
        {feedback && (
          <p className={`rounded-xl px-4 py-3 text-center font-bold motion-safe:animate-pop ${feedback.ok ? "bg-leaf/15 text-leaf-dark" : "bg-sun/30"}`}>
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
