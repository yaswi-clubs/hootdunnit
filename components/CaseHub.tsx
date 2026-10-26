"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Lock, Pencil, Shuffle } from "lucide-react";
import { CAST } from "@/lib/cast";
import { getCategory, randomCase } from "@/lib/data";
import { GAME_LIST } from "@/lib/games";
import { caseState, GAME_IDS, useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { caseHref, useCaseParam } from "@/lib/useCase";
import { Avatar, Button, Card, HootSays, Pill, Stars, VIEW_TONE } from "./ui";

export default function CaseHub() {
  const c = useCaseParam();
  const router = useRouter();
  const { progress, hydrated } = useProgress();
  const { settings } = useSettings();

  if (!c || !hydrated) return <div className="h-64" aria-busy="true" />;

  const state = caseState(progress, c.id);
  const warmups = GAME_IDS.filter((g) => state.games[g]).length;
  const reportOpen = warmups > 0 || state.hoot;
  const cat = getCategory(c.category);

  const openAnother = () => {
    router.push(caseHref("/case/", randomCase(settings.categories, c.id).id));
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-plum-soft">
        <ChevronLeft className="h-4 w-4" /> Case Board
      </Link>

      <section className="relative">
        <span className="absolute -top-3 left-4 z-10 rounded-t-lg bg-plum px-3 pb-1 pt-1.5 font-display text-xs font-black uppercase tracking-wider text-sun">
          Case file
        </span>
        <Card className="relative space-y-2 overflow-hidden border-t-4 border-plum pt-5">
          <div className="flex items-start gap-3">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-peach text-4xl" aria-hidden="true">
              {c.emoji}
            </span>
            <div>
              <Pill>
                {cat.emoji} {cat.label}
              </Pill>
              <h1 className="mt-1 font-display text-2xl font-black leading-tight">{c.title}</h1>
            </div>
          </div>
          <p className="rounded-xl bg-peach px-3 py-2 font-display text-lg font-bold leading-snug">“{c.question}”</p>
          {state.solvedAt && (
            <span className="absolute right-3 top-3 -rotate-12 rounded-lg border-4 border-leaf px-2 py-0.5 font-display text-lg font-black uppercase tracking-widest text-leaf-dark motion-safe:animate-stamp">
              Solved
            </span>
          )}
        </Card>
      </section>

      <section aria-labelledby="witness-title" className="space-y-2">
        <h2 id="witness-title" className="font-display text-xl font-extrabold">
          Meet the friends
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["a", "b"] as const).map((v) => {
            const w = CAST[c.views[v].who];
            return (
              <Card key={v} className={`space-y-2 border-l-8 ${VIEW_TONE[v].border}`}>
                <div className="flex items-center gap-3">
                  <Avatar who={w.id} view={v} />
                  <div>
                    <p className="font-display font-extrabold leading-tight">
                      {w.name} <span className="font-semibold text-plum-soft">{w.job}</span>
                    </p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white ${VIEW_TONE[v].bg}`}>{c.views[v].stance}</span>
                  </div>
                </div>
                <p className="text-[15px] leading-snug">“{c.views[v].says}”</p>
              </Card>
            );
          })}
        </div>
        <HootSays>
          {CAST[c.views.a.who].name} and {CAST[c.views.b.who].name} are both lovely, and they both have reasons. Let&apos;s find out what they are!
        </HootSays>
      </section>

      <section aria-labelledby="trail-title" className="space-y-3">
        <h2 id="trail-title" className="font-display text-xl font-extrabold">
          Your case trail
        </h2>

        <TrailStep n={1} title="Warm-up games" done={warmups === 3} note={`${warmups}/3 played`}>
          <div className="grid grid-cols-3 gap-2">
            {GAME_LIST.map((g) => {
              const stars = state.games[g.id] ?? 0;
              return (
                <Link
                  key={g.id}
                  href={caseHref("/arena/", c.id, { game: g.id })}
                  className="flex flex-col items-center gap-1 rounded-2xl bg-peach p-2 text-center transition hover:bg-peach-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {g.emoji}
                  </span>
                  <span className="text-xs font-extrabold leading-tight">{g.name}</span>
                  {stars ? <Stars value={stars} size="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold text-iris-dark">Play</span>}
                </Link>
              );
            })}
          </div>
        </TrailStep>

        <TrailStep n={2} title="Chat with Hoot" done={state.hoot} note={state.hoot ? "Case notes saved" : "3 curious questions"}>
          <Link
            href={caseHref("/spar/", c.id)}
            className="flex items-center gap-3 rounded-2xl bg-peach p-3 transition hover:bg-peach-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
          >
            <span className="text-3xl" aria-hidden="true">
              🦉
            </span>
            <span className="flex-1 text-sm">
              <span className="block font-extrabold">Talk it through with Hoot</span>
              <span className="text-plum-soft">Share your hunch and Hoot will ask you some curious questions.</span>
            </span>
          </Link>
        </TrailStep>

        <TrailStep n={3} title="Crack the case!" done={Boolean(state.solvedAt)} note="Big reward" boss>
          {state.report ? (
            <div className="space-y-2">
              <p className="rounded-xl bg-leaf/10 p-3 text-[15px] leading-relaxed">{state.report}</p>
              <Link href={caseHref("/peel/", c.id)} className="inline-flex items-center gap-1 text-sm font-bold text-plum-soft underline underline-offset-2">
                <Pencil className="h-4 w-4" /> Write it again
              </Link>
            </div>
          ) : reportOpen ? (
            <Link
              href={caseHref("/peel/", c.id)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-leaf font-display text-lg font-bold text-white shadow-leaf transition active:translate-y-[3px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
            >
              📁 Write your Case Report
            </Link>
          ) : (
            <p className="flex items-center gap-2 rounded-2xl bg-plum/5 p-3 text-sm font-semibold text-plum-soft">
              <Lock className="h-4 w-4 shrink-0" /> Play a warm-up game or chat with Hoot to unlock your Case Report.
            </p>
          )}
        </TrailStep>
      </section>

      <Button variant="secondary" className="w-full" onClick={openAnother}>
        <Shuffle className="h-4 w-4" /> Try a different case
      </Button>
    </div>
  );
}

function TrailStep({
  n,
  title,
  note,
  done,
  boss,
  children,
}: {
  n: number;
  title: string;
  note: string;
  done: boolean;
  boss?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={`space-y-3 ${boss ? "ring-4 ring-sun" : ""}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-full font-display font-black ${done ? "bg-leaf text-white" : "bg-plum text-white"}`}>
          {done ? <Check className="h-5 w-5" strokeWidth={3.5} /> : n}
        </span>
        <h3 className="flex-1 font-display text-lg font-extrabold">{title}</h3>
        <span className="text-xs font-bold text-plum-soft">{note}</span>
      </div>
      {children}
    </Card>
  );
}
