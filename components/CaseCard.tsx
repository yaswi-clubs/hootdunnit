"use client";

import Link from "next/link";
import { CAST } from "@/lib/cast";
import { getCategory, type Case } from "@/lib/data";
import { stepsDone } from "@/lib/progress";
import { caseHref } from "@/lib/useCase";
import type { CaseState } from "@/lib/types";
import { ProgressBar } from "./ui";

export default function CaseCard({ c, state }: { c: Case; state: CaseState }) {
  const done = stepsDone(state);
  const solved = Boolean(state.solvedAt);
  const cat = getCategory(c.category);

  return (
    <Link
      href={caseHref("/case/", c.id)}
      className="relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-white p-3 shadow-soft transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
    >
      <span className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-peach text-2xl" aria-hidden="true">
          {c.emoji}
        </span>
        <span className="flex -space-x-2" aria-hidden="true">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-tang/20 text-sm ring-2 ring-white">{CAST[c.views.a.who].emoji}</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-iris/20 text-sm ring-2 ring-white">{CAST[c.views.b.who].emoji}</span>
        </span>
      </span>
      <span className="text-[11px] font-bold text-plum/45">
        {cat.emoji} {cat.label}
      </span>
      <span className="font-display text-[15px] font-extrabold leading-tight">{c.title.replace("The Case of the ", "")}</span>
      <span className="mt-auto">
        {solved ? (
          <span className="inline-block -rotate-6 rounded-md border-2 border-leaf px-2 py-0.5 font-display text-xs font-black uppercase tracking-wider text-leaf-dark">
            Solved
          </span>
        ) : done > 0 ? (
          <span className="flex items-center gap-2">
            <ProgressBar value={done} max={5} className="flex-1" tone="bg-leaf" />
            <span className="text-[11px] font-bold text-plum-soft">{done}/5</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-iris-dark">New case!</span>
        )}
      </span>
    </Link>
  );
}
