"use client";

import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, X } from "lucide-react";
import { CONNECTOR_GROUPS } from "@/lib/data";

export default function WordBankDrawer({
  open,
  targetLabel,
  onClose,
  onPick,
}: {
  open: boolean;
  targetLabel: string;
  onClose: () => void;
  onPick: (word: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(CONNECTOR_GROUPS[0].id);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="word-bank-title">
      <button type="button" aria-label="Close word bank" className="absolute inset-0 animate-fade bg-plum/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-h-[78dvh] max-w-xl animate-slide-up overflow-y-auto rounded-t-3xl bg-peach p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-plum/15" aria-hidden="true" />
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-iris" />
          <h2 id="word-bank-title" className="font-display text-xl font-black">
            Word bank
          </h2>
          <button type="button" onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-3 text-sm text-plum-soft">Tap a word to add it to your {targetLabel} box.</p>

        <ul className="space-y-2">
          {CONNECTOR_GROUPS.map((group) => {
            const expanded = openGroup === group.id;
            const panelId = `group-${group.id}`;
            return (
              <li key={group.id} className="overflow-hidden rounded-2xl bg-white">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sun"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpenGroup(expanded ? null : group.id)}
                >
                  <span className="flex-1">
                    <span className="block font-display font-extrabold">{group.title}</span>
                    <span className="block text-xs text-plum-soft">{group.use}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 transition ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && (
                  <div id={panelId} className="flex flex-wrap gap-2 px-4 pb-4">
                    {group.words.map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => onPick(word)}
                        className="rounded-full bg-iris/10 px-3 py-1.5 text-sm font-bold text-iris-dark transition hover:bg-iris hover:text-white"
                      >
                        {word.replace(/,$/, "")}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
