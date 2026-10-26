"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { CAST } from "@/lib/cast";
import { caseOfTheDay, casesIn, type Case } from "@/lib/data";
import { caseState, rankFor, stepsDone, useProgress } from "@/lib/progress";
import { detectiveName, useSettings } from "@/lib/settings";
import { caseHref } from "@/lib/useCase";
import { playPop } from "@/lib/sound";
import CaseCard from "./CaseCard";
import CategoryChooser from "./CategoryChooser";
import { Avatar, Button, Card, HootSays, ProgressBar, VIEW_TONE } from "./ui";

type Filter = "all" | "new" | "going" | "solved";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "going", label: "Started" },
  { id: "solved", label: "Solved" },
];

export default function Dashboard() {
  const { settings, update, hydrated: settingsReady } = useSettings();
  const { progress, hydrated } = useProgress();
  const [today, setToday] = useState<Case | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [chooserOpen, setChooserOpen] = useState(false);

  const categoriesKey = settings.categories.join(",");
  useEffect(() => {
    if (settingsReady) setToday(caseOfTheDay(settings.categories));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsReady, categoriesKey]);

  const board = useMemo(() => {
    const list = casesIn(settings.categories);
    return list.filter((c) => {
      const s = caseState(progress, c.id);
      if (filter === "solved") return Boolean(s.solvedAt);
      if (filter === "new") return stepsDone(s) === 0;
      if (filter === "going") return !s.solvedAt && stepsDone(s) > 0;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey, progress, filter]);

  if (!settingsReady || !hydrated) return <div className="h-64" aria-busy="true" />;
  if (!settings.onboarded) return <Welcome />;

  const rank = rankFor(progress.points);
  const todayState = today ? caseState(progress, today.id) : null;

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-plum p-5 text-white">
        <span className="pointer-events-none absolute -right-3 -top-3 text-[88px] opacity-20 motion-safe:animate-float" aria-hidden="true">
          🔍
        </span>
        <p className="text-sm font-semibold text-white/70">{rank.title}</p>
        <h1 className="mt-0.5 font-display text-3xl font-extrabold leading-[1.05]">Hello, {detectiveName(settings)}!</h1>
        <p className="mt-1 text-white/80">The friends of Maple Hollow have questions. Let&apos;s find some clues.</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={rank.into} max={rank.needed} className="flex-1 bg-white/15" />
          <span className="text-xs font-bold text-white/80">
            {rank.next ? `${rank.needed - rank.into} pts to ${rank.next}` : `${progress.points} pts`}
          </span>
        </div>
      </section>

      {today && todayState && (
        <section aria-labelledby="today-title" className="relative">
          <span className="absolute -top-3 left-4 z-10 rounded-t-lg bg-sun px-3 pb-1 pt-1.5 font-display text-xs font-black uppercase tracking-wider">
            Today&apos;s case
          </span>
          <Card className="space-y-3 border-t-4 border-sun pt-5">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-peach text-3xl" aria-hidden="true">
                {today.emoji}
              </span>
              <div>
                <h2 id="today-title" className="font-display text-xl font-extrabold leading-tight">
                  {today.title}
                </h2>
                <p className="text-sm text-plum-soft">{today.question}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["a", "b"] as const).map((v) => (
                <div key={v} className={`flex items-center gap-2 rounded-xl p-2 ${VIEW_TONE[v].soft}`}>
                  <Avatar who={today.views[v].who} view={v} size="sm" />
                  <span className="min-w-0 text-xs">
                    <span className="block font-bold">{CAST[today.views[v].who].name}</span>
                    <span className="block truncate">{today.views[v].stance}</span>
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={caseHref("/case/", today.id)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-plum font-display font-bold text-white shadow-plum transition active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
            >
              {todayState.solvedAt ? "Look at your solved case" : stepsDone(todayState) > 0 ? "Carry on with this case" : "Open the case file"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Card>
        </section>
      )}

      <section aria-labelledby="board-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="board-title" className="font-display text-xl font-extrabold">
            Case Board
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setChooserOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Case types
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Show cases">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${filter === f.id ? "bg-plum text-white" : "bg-white text-plum-soft"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {board.length ? (
          <div className="grid grid-cols-2 gap-3">
            {board.map((c) => (
              <CaseCard key={c.id} c={c} state={caseState(progress, c.id)} />
            ))}
          </div>
        ) : (
          <Card className="text-center text-sm text-plum-soft">
            {filter === "solved" ? "No solved cases yet. Your first one is waiting!" : "Nothing here right now. Try another tab."}
          </Card>
        )}
      </section>

      {chooserOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="chooser-title">
          <button type="button" aria-label="Close" className="absolute inset-0 animate-fade bg-plum/40" onClick={() => setChooserOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[85dvh] max-w-xl animate-slide-up overflow-y-auto rounded-t-3xl bg-peach p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-3 flex items-center gap-2">
              <h2 id="chooser-title" className="font-display text-xl font-black">
                Which cases do you like?
              </h2>
              <button type="button" onClick={() => setChooserOpen(false)} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CategoryChooser value={settings.categories} onChange={(categories) => update({ categories })} />
            <Button className="mt-4 w-full" onClick={() => setChooserOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Welcome() {
  const { settings, update } = useSettings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(settings.name);

  return (
    <div className="space-y-5">
      <div className="pt-2 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-plum text-6xl motion-safe:animate-float" aria-hidden="true">
          🦉
        </div>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight">The Curious Case Club</h1>
        <p className="text-plum-soft">A detective game about ideas</p>
      </div>

      {step === 0 && (
        <div className="space-y-4 motion-safe:animate-pop">
          <HootSays>
            Hoo-hoo! I&apos;m <strong>Hoot</strong>. The friends of Maple Hollow keep asking big questions, and they need a detective to find the clues.
          </HootSays>
          <HootSays>There are no wrong answers in this club. We listen to everyone, spot the best clues, then make up our own minds.</HootSays>
          <div className="flex justify-center gap-2 py-1 text-3xl" aria-hidden="true">
            {Object.values(CAST)
              .slice(0, 6)
              .map((w) => (
                <span key={w.id}>{w.emoji}</span>
              ))}
          </div>
          <Button size="lg" className="w-full" onClick={() => setStep(1)}>
            Join the club <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 motion-safe:animate-pop">
          <HootSays>Every detective needs a name. What should I call you?</HootSays>
          <Card className="space-y-2">
            <label htmlFor="det-name" className="text-sm font-bold text-plum-soft">
              Detective…
            </label>
            <input
              id="det-name"
              className="field"
              placeholder="Your name or a secret code name"
              value={name}
              maxLength={20}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-plum-soft">It stays on this device. You can skip this.</p>
          </Card>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              update({ name: name.trim() });
              playPop();
              setStep(2);
            }}
          >
            {name.trim() ? `I'm Detective ${name.trim()}!` : "Skip"} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 motion-safe:animate-pop">
          <HootSays>Last thing! Which kinds of cases do you like? Tap to switch them on or off. You can change this any time.</HootSays>
          <CategoryChooser value={settings.categories} onChange={(categories) => update({ categories })} />
          <Button size="lg" className="w-full" onClick={() => update({ onboarded: true })}>
            Open my Case Board <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
