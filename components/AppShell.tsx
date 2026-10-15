"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeftRight, Flame, Home, MessageCircle, PenLine, Swords, Volume2, VolumeX } from "lucide-react";
import { levelFor, useProgress } from "@/lib/progress";
import { useLocalStorage } from "@/lib/storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { ProgressBar } from "./ui";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/arena", label: "Switch Sides", icon: ArrowLeftRight },
  { href: "/peel", label: "PEEL", icon: PenLine },
  { href: "/spar", label: "Spar", icon: Swords },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { progress, streak, hydrated } = useProgress();
  const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const { level, into, needed } = levelFor(progress.xp);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-plum/5 bg-peach/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 rounded-xl font-display text-lg font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-plum text-sun">
              <MessageCircle className="h-5 w-5" strokeWidth={2.75} />
            </span>
            Persuado
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-24 sm:block" aria-label={`Level ${level}, ${into} of ${needed} XP`}>
              <ProgressBar value={hydrated ? into : 0} max={needed} />
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft">Lv {hydrated ? level : 1}</span>
            <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold shadow-soft" title="Day streak">
              <Flame className={`h-4 w-4 ${streak > 0 ? "text-tang" : "text-plum/30"}`} />
              {hydrated ? streak : 0}
            </span>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, sound: !s.sound }))}
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
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
