"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftRight, PenLine, Swords, Trophy, type LucideIcon } from "lucide-react";
import { topicOfTheDay, type Topic } from "@/lib/data";
import { XP_REWARDS, levelFor, useProgress } from "@/lib/progress";
import { timeAgo } from "@/lib/format";
import type { ActivityKind } from "@/lib/types";
import { Card, Pill, ProgressBar } from "./ui";

const MODULES: { kind: ActivityKind; href: string; title: string; blurb: string; icon: LucideIcon; tone: string }[] = [
  { kind: "arena", href: "/arena", title: "Switch Sides", blurb: "Argue both ways against the clock, then pick a winner.", icon: ArrowLeftRight, tone: "bg-tang text-white" },
  { kind: "peel", href: "/peel", title: "PEEL Builder", blurb: "Build one strong paragraph, box by box.", icon: PenLine, tone: "bg-sun text-plum" },
  { kind: "spar", href: "/spar", title: "Sparring Partner", blurb: "Three rounds against a coach who spots weak spots.", icon: Swords, tone: "bg-iris text-white" },
];

const KIND_ICON: Record<ActivityKind, LucideIcon> = { arena: ArrowLeftRight, peel: PenLine, spar: Swords };

export default function Dashboard() {
  const { progress, streak, hydrated, reset } = useProgress();
  const [daily, setDaily] = useState<Topic | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setDaily(topicOfTheDay());
    setNow(Date.now());
  }, []);

  const { level, into, needed, title } = levelFor(progress.xp);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-plum p-5 text-white">
        <p className="text-sm font-semibold text-white/70">{hydrated && progress.xp > 0 ? `Level ${level} ${title}` : "Ready when you are"}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold leading-[1.05]">
          Win the argument.
          <br />
          Then win it the other way.
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={hydrated ? into : 0} max={needed} className="flex-1 bg-white/15" />
          <span className="text-xs font-bold text-white/80">
            {hydrated ? into : 0}/{needed} XP
          </span>
        </div>
        {hydrated && streak > 0 && <p className="mt-2 text-sm font-semibold text-white/80">{streak}-day streak. Keep it going.</p>}
      </section>

      {daily && (
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-peach text-2xl" aria-hidden="true">
              {daily.emoji}
            </span>
            <div>
              <p className="text-xs font-bold text-plum-soft">Today&apos;s topic</p>
              <h2 className="font-display text-xl font-extrabold leading-tight">{daily.question}</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MODULES.map((m) => (
              <Link
                key={m.kind}
                href={`${m.href}?topic=${daily.id}`}
                className="rounded-xl bg-peach px-2 py-2 text-center text-xs font-bold transition hover:bg-peach-deep focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
              >
                {m.title}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <section className="space-y-3" aria-label="Training modes">
        {MODULES.map(({ kind, href, title: moduleTitle, blurb, icon: Icon, tone }) => (
          <Link
            key={kind}
            href={href}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-soft transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
          >
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tone}`}>
              <Icon className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold">{moduleTitle}</span>
                <Pill>+{XP_REWARDS[kind]} XP</Pill>
              </span>
              <span className="block text-sm text-plum-soft">{blurb}</span>
            </span>
            <span className="text-right">
              <span className="block font-display text-2xl font-black">{hydrated ? progress.counts[kind] : 0}</span>
              <span className="block text-[11px] font-semibold text-plum-soft">done</span>
            </span>
          </Link>
        ))}
      </section>

      <section aria-label="Recent wins">
        <h2 className="mb-2 font-display text-xl font-extrabold">Recent wins</h2>
        {hydrated && progress.history.length > 0 ? (
          <ul className="space-y-2">
            {progress.history.slice(0, 6).map((item) => {
              const Icon = KIND_ICON[item.kind];
              return (
                <li key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-plum-soft" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{item.topic}</p>
                    <p className="line-clamp-2 text-sm text-plum-soft">{item.summary}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs font-semibold text-plum-soft">
                    <p className="text-plum">+{item.xp}</p>
                    <p>{now ? timeAgo(item.createdAt, now) : ""}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card className="flex items-center gap-3">
            <Trophy className="h-6 w-6 shrink-0 text-sun-dark" />
            <p className="text-sm text-plum-soft">Finish any round and it shows up here.</p>
          </Card>
        )}
      </section>

      {hydrated && progress.xp > 0 && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all XP, streaks and history on this device?")) reset();
          }}
          className="mx-auto block text-xs font-semibold text-plum/40 underline underline-offset-2"
        >
          Reset progress on this device
        </button>
      )}
    </div>
  );
}
