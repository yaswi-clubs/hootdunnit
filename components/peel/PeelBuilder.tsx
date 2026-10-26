"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Copy, Lightbulb, Sparkles } from "lucide-react";
import { CAST } from "@/lib/cast";
import { PEEL_KEYS, PEEL_STEPS, otherView, randomCase, type Case } from "@/lib/data";
import { useLocalStorage } from "@/lib/storage";
import { caseState, useProgress } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
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
  hasKindNod,
  insertAtCaret,
  isPartReady,
  type PeelDrafts,
} from "@/lib/peel";
import { caseHref, useCaseParam } from "@/lib/useCase";
import WordBankDrawer from "./WordBankDrawer";
import { Avatar, Button, Card, HootSays, Pill, VIEW_TONE } from "@/components/ui";

export default function PeelBuilder() {
  const c = useCaseParam();
  if (!c) return <div className="h-64" aria-busy="true" />;
  return <CaseReport key={c.id} c={c} />;
}

function CaseReport({ c }: { c: Case }) {
  const [drafts, setDrafts, hydrated] = useLocalStorage<PeelDrafts>(PEEL_DRAFT_KEY, {});
  const { progress, record } = useProgress();
  const { settings } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [solved, setSolved] = useState<{ points: number; report: string; kind: boolean; next: Case } | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);

  const draft = drafts[c.id] ?? EMPTY_PEEL_DRAFT;
  const setDraft = useCallback(
    (fn: (d: typeof EMPTY_PEEL_DRAFT) => typeof EMPTY_PEEL_DRAFT) =>
      setDrafts((all) => ({ ...all, [c.id]: fn(all[c.id] ?? EMPTY_PEEL_DRAFT) })),
    [setDrafts, c.id],
  );

  const hunch = caseState(progress, c.id).hunch;
  const otherName = hunch && hunch !== "both" ? CAST[c.views[otherView(hunch)].who].name : null;

  const stepIndex = Math.min(Math.max(draft.step, 0), PEEL_STEPS.length - 1);
  const step = PEEL_STEPS[stepIndex];
  const value = draft.parts[step.key];
  const isLast = stepIndex === PEEL_STEPS.length - 1;
  const allReady = PEEL_KEYS.every((k) => isPartReady(draft.parts[k]));
  const totalWords = PEEL_KEYS.reduce((sum, k) => sum + countWords(draft.parts[k]), 0);
  const checks = useMemo(() => evaluatePeel(c, draft.parts), [c, draft.parts]);

  const stems =
    step.key === "link"
      ? [otherName ? `Even though ${otherName} has a good point,` : "Even though some people see it differently,", ...step.stems.slice(1)]
      : step.stems;

  const goTo = (index: number) => {
    caretRef.current = null;
    setDraft((d) => ({ ...d, step: index }));
  };

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
    const report = buildParagraph(draft.parts);
    const kind = hasKindNod(c, draft.parts);
    const points = record({ caseId: c.id, step: "report", report, kindNod: kind, summary: report });
    celebrate();
    setSolved({ points, report, kind, next: randomCase(settings.categories, c.id) });
    setDraft(() => EMPTY_PEEL_DRAFT);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) return <div className="h-64" aria-busy="true" />;

  if (solved) {
    const next = solved.next;
    return (
      <div className="space-y-4">
        <Card className="relative space-y-3 overflow-hidden pt-8 text-center">
          <span className="mx-auto inline-block rounded-xl border-[5px] border-leaf px-4 py-1 font-display text-3xl font-black uppercase tracking-widest text-leaf-dark motion-safe:animate-stamp">
            Case solved
          </span>
          <p className="text-5xl" aria-hidden="true">
            {c.emoji}
          </p>
          <h1 className="font-display text-2xl font-black leading-tight">{c.title}</h1>
          <div className="flex flex-wrap justify-center gap-2">
            <Pill className="bg-sun text-plum">+{solved.points} detective points</Pill>
            <Pill className="bg-leaf/15 text-leaf-dark">New sticker for your Casebook</Pill>
            {solved.kind && <Pill className="bg-tang/15 text-tang-dark">💛 Kind nod</Pill>}
          </div>
        </Card>
        <Card className="space-y-2">
          <h2 className="font-display text-lg font-extrabold">Your Case Report</h2>
          <p className="text-[17px] leading-relaxed">{solved.report}</p>
          <Button variant="secondary" size="sm" onClick={async () => setCopied(await copyText(`${c.question}\n\n${solved.report}`))}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </Button>
        </Card>
        <HootSays>
          {solved.kind
            ? "Hoo-ray! A clear hunch, a good clue, and you were kind about the other idea. That's top detective work."
            : "Hoo-ray! Case closed. Next time, try a kind nod to the other idea for a bonus badge!"}
        </HootSays>
        <div className="grid gap-2">
          <Link
            href={caseHref("/case/", next.id)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-plum font-display font-bold text-white shadow-plum transition active:translate-y-[3px] active:shadow-none"
          >
            Next case: {next.emoji} {next.title.replace("The Case of the ", "")} <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/casebook/" className="flex h-12 items-center justify-center rounded-2xl border-2 border-plum/10 bg-white font-display font-bold">
            See my Casebook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href={caseHref("/case/", c.id)} className="inline-flex items-center gap-1 text-sm font-bold text-plum-soft">
        <ChevronLeft className="h-4 w-4" /> {c.title}
      </Link>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-plum-soft">Boss level</p>
        <h1 className="font-display text-3xl font-black leading-tight">Write your Case Report</h1>
        <p className="text-plum-soft">Four boxes, one brilliant answer.</p>
      </div>

      <Card className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          {c.emoji}
        </span>
        <p className="flex-1 font-display font-bold leading-snug">{c.question}</p>
        <span className="flex -space-x-2">
          <Avatar who={c.views.a.who} view="a" size="sm" />
          <Avatar who={c.views.b.who} view="b" size="sm" />
        </span>
      </Card>

      <ol className="grid grid-cols-4 gap-2" aria-label="Report steps">
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
                <span className={`grid h-9 w-9 place-items-center rounded-full text-lg ${done || active ? s.tone.solid : "bg-plum/10"}`}>
                  {done && !active ? <Check className="h-5 w-5" strokeWidth={3.5} /> : <span aria-hidden="true">{s.icon}</span>}
                </span>
                <span className="text-xs font-bold">{s.short}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <Card className={`space-y-3 border-l-8 ${step.tone.border}`}>
        <h2 className="font-display text-xl font-extrabold">
          {step.icon} {step.label}: <span className="font-bold text-plum-soft">{step.prompt}</span>
        </h2>
        <p className="flex gap-2 rounded-xl bg-peach p-3 text-sm">
          <Lightbulb className="h-5 w-5 shrink-0 text-sun-dark" />
          {step.tip}
        </p>
        <div className="flex flex-wrap gap-2">
          {stems.map((stem) => (
            <button key={stem} type="button" onClick={() => insert(stem)} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${step.tone.soft}`}>
              {stem.replace(/,$/, "")}…
            </button>
          ))}
        </div>

        {step.key === "evidence" && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-plum-soft">Borrow a clue:</p>
            <div className="flex flex-col gap-1.5">
              {c.clues.map((cl) => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => insert(cl.text.replace(/\.$/, ""))}
                  className={`flex items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:brightness-95 ${VIEW_TONE[cl.view].soft}`}
                >
                  <span aria-hidden="true">{cl.kind === "fact" ? "🔍" : "💭"}</span>
                  {cl.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="report-box" className="sr-only">
          {step.label}
        </label>
        <textarea
          id="report-box"
          ref={textareaRef}
          className="field min-h-[130px]"
          placeholder={step.placeholder}
          value={value}
          maxLength={400}
          onChange={(e) => {
            const next = e.target.value;
            setDraft((d) => ({ ...d, parts: { ...d.parts, [step.key]: next } }));
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
            <Button variant="leaf" className="flex-1" disabled={!allReady} onClick={finish}>
              <Sparkles className="h-5 w-5" /> Close the case!
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => goTo(stepIndex + 1)}>
              Next: {PEEL_STEPS[stepIndex + 1].label} <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        {isLast && !allReady && <p className="text-center text-xs text-plum-soft">Write at least 3 words in every box to close the case.</p>}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">Your report so far</h3>
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
      </Card>

      <Card>
        <h3 className="mb-2 font-display text-lg font-extrabold">🦉 Hoot&apos;s checklist</h3>
        <ul className="space-y-1.5">
          {checks.map((ch) => (
            <li key={ch.key} className="flex items-center gap-2 text-sm">
              <span className={`grid h-5 w-5 place-items-center rounded-full ${ch.ok ? (ch.bonus ? "bg-tang text-white" : "bg-leaf text-white") : "bg-plum/10"}`}>
                {ch.ok && <Check className="h-3 w-3" strokeWidth={4} />}
              </span>
              <span className={ch.ok ? "font-semibold" : "text-plum-soft"}>{ch.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-plum-soft">These are tips, not rules. You can close the case whenever every box has a few words.</p>
      </Card>

      <WordBankDrawer
        open={drawerOpen}
        targetLabel={step.label}
        onClose={() => setDrawerOpen(false)}
        onPick={(word) => {
          insert(word);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
