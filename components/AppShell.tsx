"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bird, BookOpen, FolderOpen, Puzzle, Search, Sparkles, Volume2, VolumeX } from "lucide-react";
import { rankFor, useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { ProgressBar } from "./ui";

const NAV = [
  { href: "/", label: "Cases", icon: FolderOpen },
  { href: "/arena", label: "Games", icon: Puzzle },
  { href: "/spar", label: "Hoot", icon: Bird },
  { href: "/casebook", label: "Casebook", icon: BookOpen },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { progress, streak, hydrated } = useProgress();
  const { settings, update } = useSettings();
  const { level, into, needed, title } = rankFor(progress.points);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-plum/5 bg-peach/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 rounded-xl font-display text-lg font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-plum text-sun">
              <Search className="h-5 w-5" strokeWidth={3} />
            </span>
            Persuado
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/casebook"
              className="hidden items-center gap-2 rounded-full bg-white px-2.5 py-1 shadow-soft sm:flex"
              aria-label={`${title}, ${into} of ${needed} points to the next rank`}
            >
              <span className="text-xs font-bold">{hydrated ? title : "Junior Sleuth"}</span>
              <ProgressBar value={hydrated ? into : 0} max={needed} className="w-16" />
            </Link>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft sm:hidden">Rank {hydrated ? level : 1}</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft" title="Days in a row">
              <Sparkles className={`h-4 w-4 ${streak > 0 ? "text-sun-dark" : "text-plum/30"}`} />
              {hydrated ? streak : 0}
            </span>
            <button
              type="button"
              onClick={() => update({ sound: !settings.sound })}
              className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
              aria-label={settings.sound ? "Turn sound off" : "Turn sound on"}
              aria-pressed={settings.sound}
            >
              {settings.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-plum/40" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-plum/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Main">
        <ul className="mx-auto grid max-w-xl grid-cols-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" || pathname.startsWith("/case/") || pathname.startsWith("/peel") : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sun ${active ? "text-plum" : "text-plum/45"}`}
                >
                  <span className={`grid h-8 w-12 place-items-center rounded-full transition ${active ? "bg-sun" : ""}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
