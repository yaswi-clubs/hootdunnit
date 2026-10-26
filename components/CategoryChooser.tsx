"use client";

import { Check } from "lucide-react";
import { CATEGORIES, CASES, type CategoryId } from "@/lib/data";
import { playPop } from "@/lib/sound";

/** Big tappable tiles. She can't turn every category off: at least one stays on. */
export default function CategoryChooser({ value, onChange }: { value: CategoryId[]; onChange: (next: CategoryId[]) => void }) {
  const toggle = (id: CategoryId) => {
    const on = value.includes(id);
    if (on && value.length === 1) return;
    playPop();
    onChange(on ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <ul className="grid grid-cols-2 gap-2">
      {CATEGORIES.map((cat) => {
        const on = value.includes(cat.id);
        const count = CASES.filter((c) => c.category === cat.id).length;
        return (
          <li key={cat.id}>
            <button
              type="button"
              onClick={() => toggle(cat.id)}
              aria-pressed={on}
              className={`relative flex h-full w-full flex-col items-start gap-0.5 rounded-2xl border-2 p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${on ? "border-plum bg-white" : "border-transparent bg-white/50 opacity-70"}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {cat.emoji}
              </span>
              <span className="font-display font-extrabold leading-tight">{cat.label}</span>
              <span className="text-xs text-plum-soft">{cat.blurb}</span>
              <span className="text-[11px] font-bold text-plum/40">{count} cases</span>
              <span className={`absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full ${on ? "bg-leaf text-white" : "bg-plum/10"}`}>
                {on && <Check className="h-4 w-4" strokeWidth={3.5} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
