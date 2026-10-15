"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, ChevronLeft, ChevronRight, Copy, Lightbulb, RotateCcw, Shuffle, Sparkles, Trophy } from "lucide-react";
import { PEEL_KEYS, PEEL_STEPS, getTopic, randomTopic, topicIdFromUrl } from "@/lib/data";
import { useLocalStorage } from "@/lib/storage";
import { useProgress } from "@/lib/progress";
import { celebrate } from "@/lib/celebrate";
import { playPop } from "@/lib/sound";
import { countWords } from "@/lib/readability";
import { copyText } from "@/lib/format";
import {
  EMPTY_PEEL_DRAFT,
  PEEL_DRAFT_KEY,
  buildParagraph,
  evaluatePeel,
  finaliseSentence,
  insertAtCaret,
  isPartReady,
  type PeelDraft,
} from "@/lib/peel";
import WordBankDrawer from "./WordBankDrawer";
import { Button, Card, Pill } from "@/components/ui";

export default function PeelBuilder() {
  const [draft, setDraft, hydrated] = useLocalStorage<PeelDraft>(PEEL_DRAFT_KEY, EMPTY_PEEL_DRAFT);
  const { record } = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completed, setCompleted] = useState<{ xp: number; paragraph: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);

  // First load: use ?topic= if the draft is empty, otherwise make sure there's a question.
  useEffect(() => {
    if (!hydrated) return;
    const fromUrl = getTopic(topicIdFromUrl());
    const empty = PEEL_KEYS.every((k) => !draft.parts[k].trim());
    if (fromUrl && empty) setDraft((d) => ({ ...d, title: fromUrl.question }));
    else if (!draft.title) setDraft((d) => ({ ...d, title: randomTopic().question }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const stepIndex = Math.min(Math.max(draft.step, 0), PEEL_STEPS.length - 1);
  const step = PEEL_STEPS[stepIndex];
  const value = draft.parts[step.key];
  const isLast = stepIndex === PEEL_STEPS.length - 1;
  const allReady = PEEL_KEYS.every((k) => isPartReady(draft.parts[k]));
  const totalWords = PEEL_KEYS.reduce((sum, k) => sum + countWords(draft.parts[k]), 0);
  const checks = useMemo(() => evaluatePeel(draft.title, draft.parts), [draft.title, draft.parts]);

  const goTo = (index: number) => {
    caretRef.current = null;
    setDraft((d) => ({ ...d, step: index }));
  };

  const updatePart = (text: string) => setDraft((d) => ({ ...d, parts: { ...d.parts, [step.key]: text } }));

  const insert = useCallback(
    (snippet: string) => {
      const pos = caretRef.current ?? value.length;
      const { value: next, caret } = insertAtCaret(value, pos, snippet);
      setDraft((d) => ({ ...d, parts: { ...d.parts, [step.key]: next } }));
      caretRef.current = caret;
      playPop();
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(caret, caret);
        }
      });
    },
    [setDraft, step.key, value],
  );

  const trackCaret = (el: HTMLTextAreaElement) => {
    caretRef.current = el.selectionStart;
  };

  const finish = () => {
    if (!allReady) return;
    const paragraph = buildParagraph(draft.parts);
    const xp = record("peel", draft.title || "PEEL paragraph", paragraph);
    celebrate();
    setCompleted({ xp, paragraph });
  };

  const startNew = () => {
    setDraft({ ...EMPTY_PEEL_DRAFT, title: randomTopic().question });
    setCompleted(null);
    setCopied(false);
    caretRef.current = null;
  };

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black leading-tight">PEEL Builder</h1>
        <p className="text-plum-soft">Point, Evidence, Explain, Link. Four boxes, one strong paragraph.</p>
      </div>

      <Card className="space-y-2">
        <label htmlFor="peel-title" className="text-sm font-bold text-plum-soft">
          Your question
        </label>
        <div className="flex gap-2">
          <input
            id="peel-title"
            className="field"
            value={draft.title}
            maxLength={120}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
          <Button variant="secondary" className="shrink-0 px-3" aria-label="New question" onClick={() => setDraft((d) => ({ ...d, title: randomTopic().question }))}>
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {completed ? (
        <Card className="motion-safe:animate-pop space-y-3 text-center">
          <Trophy className="mx-auto h-12 w-12 text-sun-dark" />
          <h2 className="font-display text-3xl font-black">Paragraph done!</h2>
          <Pill className="bg-sun text-plum">+{completed.xp} XP</Pill>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={async () => setCopied(await copyText(`${draft.title}\n\n${completed.paragraph}`))}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={startNew}>
              <RotateCcw className="h-4 w-4" /> Write another
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Stepper */}
          <ol className="grid grid-cols-4 gap-2" aria-label="PEEL steps">
            {PEEL_STEPS.map((s, i) => {
              const done = isPartReady(draft.parts[s.key]);
              const active = i === stepIndex;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 py-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${active ? `${s.tone.border} bg-white` : "border-transparent bg-white/60"}`}
                  >
                    <span className={`grid h-9 w-9 place-items-center rounded-full font-display text-lg font-black ${done || active ? s.tone.solid : "bg-plum/10 text-plum/50"}`}>
                      {done && !active ? <Check className="h-5 w-5" strokeWidth={3.5} /> : s.letter}
                    </span>
                    <span className="text-xs font-bold">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Active box */}
          <Card className={`space-y-3 border-l-8 ${step.tone.border}`}>
            <div>
              <h2 className="font-display text-xl font-extrabold">
                {step.label}: <span className="font-bold text-plum-soft">{step.prompt}</span>
              </h2>
            </div>
            <p className="flex gap-2 rounded-xl bg-peach p-3 text-sm">
              <Lightbulb className="h-5 w-5 shrink-0 text-sun-dark" />
              {step.tip}
            </p>
            <div className="flex flex-wrap gap-2">
              {step.stems.map((stem) => (
                <button key={stem} type="button" onClick={() => insert(stem)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${step.tone.soft}`}>
                  {stem.replace(/,$/, "")}…
                </button>
              ))}
            </div>
            <label htmlFor="peel-box" className="sr-only">
              {step.label}
            </label>
            <textarea
              id="peel-box"
              ref={textareaRef}
              className="field min-h-[130px]"
              placeholder={step.placeholder}
              value={value}
              maxLength={400}
              onChange={(e) => {
                updatePart(e.target.value);
                trackCaret(e.currentTarget);
              }}
              onSelect={(e) => trackCaret(e.currentTarget)}
              onKeyUp={(e) => trackCaret(e.currentTarget)}
              onClick={(e) => trackCaret(e.currentTarget)}
            />
            <div className="flex items-center justify-between text-xs font-semibold text-plum-soft">
              <span>{countWords(value)} words</span>
              <button type="button" onClick={() => setDrawerOpen(true)} className="flex items-center gap-1 rounded-full bg-iris/10 px-3 py-1.5 text-sm font-bold text-iris-dark">
                <BookOpen className="h-4 w-4" /> Word bank
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={stepIndex === 0} onClick={() => goTo(stepIndex - 1)} aria-label="Previous step" className="px-4">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {isLast ? (
                <Button className="flex-1" disabled={!allReady} onClick={finish}>
                  <Sparkles className="h-5 w-5" /> Finish paragraph
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => goTo(stepIndex + 1)}>
                  Next: {PEEL_STEPS[stepIndex + 1].label} <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>
            {isLast && !allReady && (
              <p className="text-center text-xs text-plum-soft">Write at least 3 words in every box to finish.</p>
            )}
          </Card>
        </>
      )}

      {/* Live preview */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">Live preview</h3>
          <span className="text-xs font-semibold text-plum-soft">{totalWords} words</span>
        </div>
        <p className="text-[17px] leading-loose" aria-live="polite">
          {PEEL_STEPS.map((s) => {
            const text = finaliseSentence(draft.parts[s.key]);
            return (
              <span key={s.key}>
                {text ? (
                  <span className={`rounded-md px-1 py-0.5 box-decoration-clone ${s.tone.soft}`}>{text}</span>
                ) : (
                  <span className="rounded-md bg-plum/5 px-1 py-0.5 italic text-plum/35">[{s.label}]</span>
                )}{" "}
              </span>
            );
          })}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PEEL_STEPS.map((s) => (
            <span key={s.key} className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.tone.solid}`}>
              {s.label}
            </span>
          ))}
        </div>
      </Card>

      {/* Coach checklist */}
      <Card>
        <h3 className="mb-2 font-display text-lg font-extrabold">Coach&apos;s checklist</h3>
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li key={c.key} className="flex items-center gap-2 text-sm">
              <span className={`grid h-5 w-5 place-items-center rounded-full ${c.ok ? "bg-leaf text-white" : "bg-plum/10"}`}>
                {c.ok && <Check className="h-3 w-3" strokeWidth={4} />}
              </span>
              <span className={c.ok ? "font-semibold" : "text-plum-soft"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      <WordBankDrawer
        open={drawerOpen}
        targetLabel={step.label}
        onClose={closeDrawer}
        onPick={(word) => {
          insert(word);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
