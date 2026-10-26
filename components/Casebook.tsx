"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { BADGES } from "@/lib/badges";
import { getCase } from "@/lib/data";
import { RANKS, rankFor, useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { caseHref } from "@/lib/useCase";
import { timeAgo } from "@/lib/format";
import CategoryChooser from "./CategoryChooser";
import { Card, ProgressBar } from "./ui";

export default function Casebook() {
  const { progress, streak, solvedCount, reset, hydrated } = useProgress();
  const { settings, update } = useSettings();
  const [openCase, setOpenCase] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);

  if (!hydrated) return <div className="h-64" aria-busy="true" />;

  const rank = rankFor(progress.points);
  const solved = Object.entries(progress.cases)
    .filter(([, s]) => s.solvedAt)
    .sort(([, a], [, b]) => (b.solvedAt ?? 0) - (a.solvedAt ?? 0));
  const now = Date.now();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-black leading-tight">My Casebook</h1>
        <p className="text-plum-soft">Every case you&apos;ve cracked, every badge you&apos;ve earned.</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-plum text-3xl" aria-hidden="true">
            🕵️
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-plum-soft">Detective rank</p>
            <p className="font-display text-2xl font-black leading-tight">{rank.title}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-black">{progress.points}</p>
            <p className="text-[11px] font-bold text-plum-soft">points</p>
          </div>
        </div>
        <ProgressBar value={rank.into} max={rank.needed} />
        <ol className="flex flex-wrap gap-1.5">
          {RANKS.map((r, i) => (
            <li key={r} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${i < rank.level ? "bg-sun" : "bg-plum/5 text-plum/40"}`}>
              {r}
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value={solvedCount} label="cases solved" />
          <Stat value={streak} label="days in a row" />
          <Stat value={progress.hootChats} label="chats with Hoot" />
        </div>
      </Card>

      <section aria-labelledby="badges-title" className="space-y-2">
        <h2 id="badges-title" className="font-display text-xl font-extrabold">
          Badges
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BADGES.map((b) => {
            const got = b.earned(progress, streak);
            return (
              <li key={b.id} className={`flex items-center gap-2 rounded-2xl p-3 ${got ? "bg-white shadow-soft" : "bg-white/40"}`}>
                <span className={`text-3xl ${got ? "" : "opacity-25 grayscale"}`} aria-hidden="true">
                  {b.emoji}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-extrabold leading-tight ${got ? "" : "text-plum/50"}`}>{b.name}</span>
                  <span className="block text-[11px] leading-tight text-plum-soft">{got ? "Earned!" : b.how}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="solved-title" className="space-y-2">
        <h2 id="solved-title" className="font-display text-xl font-extrabold">
          Solved cases
        </h2>
        {solved.length === 0 ? (
          <Card className="text-sm text-plum-soft">
            No stickers yet. Solve a case and its sticker lands here.{" "}
            <Link href="/" className="font-bold text-plum underline">
              Go to the Case Board
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2" aria-label="Stickers">
              {solved.map(([id]) => {
                const c = getCase(id);
                return c ? (
                  <span key={id} className="grid h-12 w-12 -rotate-6 place-items-center rounded-full bg-white text-2xl shadow-soft ring-4 ring-sun odd:rotate-6" title={c.title}>
                    {c.emoji}
                  </span>
                ) : null;
              })}
            </div>
            <ul className="space-y-2">
              {solved.map(([id, s]) => {
                const c = getCase(id);
                if (!c) return null;
                const open = openCase === id;
                return (
                  <li key={id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                    <button
                      type="button"
                      onClick={() => setOpenCase(open ? null : id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sun"
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {c.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold leading-tight">{c.title}</span>
                        <span className="text-xs text-plum-soft">
                          Solved {timeAgo(s.solvedAt ?? now, now)}
                          {s.kindNod ? " · 💛 kind nod" : ""}
                        </span>
                      </span>
                      <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="space-y-2 px-4 pb-4">
                        <p className="text-sm font-bold text-plum-soft">{c.question}</p>
                        <p className="text-[15px] leading-relaxed">{s.report}</p>
                        <Link href={caseHref("/case/", c.id)} className="text-sm font-bold underline underline-offset-2">
                          Open case file
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="settings-title" className="space-y-3">
        <h2 id="settings-title" className="font-display text-xl font-extrabold">
          Detective settings
        </h2>
        <Card className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-plum-soft">
            Detective name
          </label>
          <input
            id="name"
            className="field"
            maxLength={20}
            autoComplete="off"
            placeholder="Your name or a code name"
            value={nameDraft ?? settings.name}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (nameDraft !== null) update({ name: nameDraft.trim() });
              setNameDraft(null);
            }}
          />
        </Card>
        <div className="space-y-2">
          <p className="text-sm font-bold text-plum-soft">Case types on your board</p>
          <CategoryChooser value={settings.categories} onChange={(categories) => update({ categories })} />
        </div>
        {progress.points > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start fresh? This clears points, badges and solved cases on this device.")) reset();
            }}
            className="mx-auto block pt-2 text-xs font-semibold text-plum/40 underline underline-offset-2"
          >
            Start fresh on this device
          </button>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-peach p-2">
      <p className="font-display text-2xl font-black">{value}</p>
      <p className="text-[11px] font-bold leading-tight text-plum-soft">{label}</p>
    </div>
  );
}
