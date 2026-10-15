"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Copy, Play, RotateCcw, Shuffle, Trophy, X } from "lucide-react";
import { ARENA_STEMS, REASON_STEMS, TOPICS, getTopic, opposite, randomTopic, topicIdFromUrl, type Topic } from "@/lib/data";
import type { Side } from "@/lib/types";
import { useCountdown } from "@/hooks/useCountdown";
import { useProgress } from "@/lib/progress";
import { celebrate } from "@/lib/celebrate";
import { playBuzzer, playPop, playTick } from "@/lib/sound";
import { countWords } from "@/lib/readability";
import { SYNTHESIS_TEMPLATE, buildSynthesis, isSynthesisReady, synthesisParts } from "@/lib/synthesis";
import { copyText } from "@/lib/format";
import TopicPicker from "@/components/TopicPicker";
import TimerRing from "@/components/TimerRing";
import { Button, Card, Pill } from "@/components/ui";

type Phase = "setup" | "for" | "switch" | "against" | "synthesis" | "complete";
type Pair = [string, string];

const ROUND_SECONDS = 60;
const SWITCH_PAUSE_MS = 2200;
const SIDE_LABEL: Record<Side, string> = { for: "FOR", against: "AGAINST" };

function firstFilled(points: Pair): number {
  const i = points.findIndex((p) => p.trim().length > 0);
  return i === -1 ? 0 : i;
}

export default function SwitchSidesArena() {
  const { record } = useProgress();
  const [topic, setTopic] = useState<Topic>(TOPICS[0]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [points, setPoints] = useState<Record<Side, Pair>>({ for: ["", ""], against: ["", ""] });
  const [winner, setWinner] = useState<Side>("for");
  const [chosen, setChosen] = useState<Record<Side, number>>({ for: 0, against: 0 });
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<{ sentence: string; xp: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Pick the topic on the client to avoid a server/client mismatch.
  useEffect(() => {
    setTopic(getTopic(topicIdFromUrl()) ?? randomTopic());
  }, []);

  const writing = phase === "for" || phase === "against";

  const advance = () => {
    if (phase === "for") {
      playBuzzer();
      setPhase("switch");
    } else if (phase === "against") {
      playPop();
      setChosen({ for: firstFilled(points.for), against: firstFilled(points.against) });
      setPhase("synthesis");
    }
  };

  const remaining = useCountdown(ROUND_SECONDS, writing, advance, phase);

  useEffect(() => {
    if (writing && remaining > 0 && remaining <= 5) playTick();
  }, [remaining, writing]);

  useEffect(() => {
    if (phase !== "switch") return;
    const t = window.setTimeout(() => setPhase("against"), SWITCH_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const setPoint = (side: Side, index: number, value: string) =>
    setPoints((prev) => {
      const next: Pair = [...prev[side]] as Pair;
      next[index] = value;
      return { ...prev, [side]: next };
    });

  const startRound = () => {
    playPop();
    setPoints({ for: ["", ""], against: ["", ""] });
    setReason("");
    setWinner("for");
    setResult(null);
    setCopied(false);
    setPhase("for");
  };

  const quit = () => setPhase("setup");

  const loser = opposite(winner);
  const synthesisInput = {
    against: points[loser][chosen[loser]] ?? "",
    forPoint: points[winner][chosen[winner]] ?? "",
    reason,
  };
  const ready = isSynthesisReady(synthesisInput);

  const lockIn = () => {
    if (!ready) return;
    const sentence = buildSynthesis(synthesisInput);
    const xp = record("arena", topic.motion, sentence);
    celebrate();
    setResult({ sentence, xp });
    setPhase("complete");
  };

  /* ---------------------------- Setup ---------------------------- */
  if (phase === "setup") {
    return (
      <div className="space-y-4">
        <Intro />
        <TopicPicker topic={topic} onChange={setTopic} />
        <Card className="space-y-3">
          <h3 className="font-display text-lg font-extrabold">How a round works</h3>
          <ol className="space-y-2 text-sm text-plum-soft">
            <li className="flex gap-2"><StepDot className="bg-tang">1</StepDot> 60 seconds: write 2 points FOR.</li>
            <li className="flex gap-2"><StepDot className="bg-iris">2</StepDot> Buzzer! 60 seconds: write 2 points AGAINST.</li>
            <li className="flex gap-2"><StepDot className="bg-sun text-plum">3</StepDot> Pick the strongest points and build one killer sentence.</li>
          </ol>
          <Button size="lg" className="w-full" onClick={startRound}>
            <Play className="h-5 w-5" fill="currentColor" /> Start the clock
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------------------------- Switch ---------------------------- */
  if (phase === "switch") {
    return (
      <button
        type="button"
        onClick={() => setPhase("against")}
        className="fixed inset-0 z-50 grid place-items-center bg-iris text-white"
        aria-live="assertive"
      >
        <div className="motion-safe:animate-buzz text-center">
          <ArrowLeftRight className="mx-auto h-20 w-20" strokeWidth={3} />
          <p className="mt-4 font-display text-5xl font-black">Switch sides!</p>
          <p className="mt-2 text-lg font-semibold text-white/80">Now argue AGAINST. Tap to start.</p>
        </div>
      </button>
    );
  }

  /* ---------------------------- Writing ---------------------------- */
  if (phase === "for" || phase === "against") {
    const side: Side = phase;
    const sidePoints = points[side];
    const bothFilled = sidePoints.every((p) => countWords(p) >= 2);
    return (
      <div className="space-y-4">
        <div className={`flex items-center gap-4 rounded-2xl p-4 text-white ${side === "for" ? "bg-tang" : "bg-iris"}`}>
          <TimerRing remaining={remaining} total={ROUND_SECONDS} side={side} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/85">Argue {SIDE_LABEL[side]}</p>
            <p className="font-display text-2xl font-black leading-tight">{topic.motion}</p>
          </div>
          <button type="button" onClick={quit} className="ml-auto self-start rounded-full p-1.5 hover:bg-white/15" aria-label="Quit round">
            <X className="h-5 w-5" />
          </button>
        </div>

        {[0, 1].map((i) => (
          <PointField
            key={`${side}-${i}`}
            side={side}
            index={i}
            value={sidePoints[i]}
            autoFocus={i === 0}
            onChange={(v) => setPoint(side, i, v)}
          />
        ))}

        <div>
          <p className="mb-2 text-sm font-bold text-plum-soft">Stuck? Tap a starter</p>
          <div className="flex flex-wrap gap-2">
            {ARENA_STEMS[side].map((stem) => (
              <button
                key={stem}
                type="button"
                onClick={() => {
                  const target = sidePoints[0].trim() === "" ? 0 : 1;
                  const current = sidePoints[target];
                  setPoint(side, target, current.trim() ? `${current.trimEnd()} ${stem} ` : `${stem} `);
                  playPop();
                }}
                className={`rounded-full border-2 bg-white px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 ${side === "for" ? "border-tang/40" : "border-iris/40"}`}
              >
                {stem}…
              </button>
            ))}
          </div>
        </div>

        <Button variant={side} size="lg" className="w-full" disabled={!bothFilled} onClick={advance}>
          <Check className="h-5 w-5" /> {side === "for" ? "Done, switch sides" : "Done, build my sentence"}
        </Button>
      </div>
    );
  }

  /* ---------------------------- Synthesis ---------------------------- */
  if (phase === "synthesis") {
    const parts = synthesisParts(synthesisInput);
    const t = SYNTHESIS_TEMPLATE;
    return (
      <div className="space-y-4">
        <Card className="space-y-2">
          <Pill className="bg-sun text-plum">Synthesis</Pill>
          <h2 className="font-display text-2xl font-black leading-tight">Which side won you over?</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["for", "against"] as Side[]).map((s) => (
              <Button key={s} variant={winner === s ? s : "secondary"} onClick={() => setWinner(s)} aria-pressed={winner === s}>
                {SIDE_LABEL[s]}
              </Button>
            ))}
          </div>
        </Card>

        <PointChooser
          title={`Strongest ${SIDE_LABEL[loser]} point to answer`}
          side={loser}
          points={points[loser]}
          selected={chosen[loser]}
          onSelect={(i) => setChosen((c) => ({ ...c, [loser]: i }))}
          onAdd={(v) => setPoint(loser, 0, v)}
        />
        <PointChooser
          title={`Your winning ${SIDE_LABEL[winner]} point`}
          side={winner}
          points={points[winner]}
          selected={chosen[winner]}
          onSelect={(i) => setChosen((c) => ({ ...c, [winner]: i }))}
          onAdd={(v) => setPoint(winner, 0, v)}
        />

        <Card className="space-y-2">
          <label htmlFor="reason" className="font-display text-lg font-extrabold">
            Why is it more compelling?
          </label>
          <textarea
            id="reason"
            className="field min-h-[84px] border-sun"
            placeholder="because it affects more people…"
            value={reason}
            maxLength={200}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {REASON_STEMS.map((stem) => (
              <button key={stem} type="button" onClick={() => setReason(stem)} className="rounded-full bg-sun/30 px-3 py-1.5 text-sm font-semibold hover:bg-sun/50">
                {stem}
              </button>
            ))}
          </div>
        </Card>

        <Card className="border-2 border-dashed border-plum/15">
          <p className="mb-2 text-sm font-bold text-plum-soft">Your sentence</p>
          <p className="font-display text-xl font-bold leading-relaxed" aria-live="polite">
            {t.open}
            <Slot text={parts.against} empty="their point" className={loser === "for" ? "bg-tang/20" : "bg-iris/20"} />
            {t.middle}
            <Slot text={parts.forPoint} empty="your point" className={winner === "for" ? "bg-tang/20" : "bg-iris/20"} />
            {t.because}
            <Slot text={parts.reason} empty="your reason" className="bg-sun/40" />
            {t.close}
          </p>
        </Card>

        <Button size="lg" className="w-full" disabled={!ready} onClick={lockIn}>
          <Trophy className="h-5 w-5" /> Lock it in
        </Button>
      </div>
    );
  }

  /* ---------------------------- Complete ---------------------------- */
  return (
    <div className="space-y-4">
      <Card className="motion-safe:animate-pop space-y-3 text-center">
        <Trophy className="mx-auto h-12 w-12 text-sun-dark" />
        <h2 className="font-display text-3xl font-black">Round won!</h2>
        <Pill className="bg-sun text-plum">+{result?.xp ?? 0} XP</Pill>
        <blockquote className="rounded-2xl bg-peach p-4 text-left font-display text-lg font-bold leading-relaxed">
          {result?.sentence}
        </blockquote>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              if (result) setCopied(await copyText(result.sentence));
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="secondary" onClick={startRound}>
            <RotateCcw className="h-4 w-4" /> Same topic
          </Button>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setTopic(randomTopic(topic.id));
            setPhase("setup");
          }}
        >
          <Shuffle className="h-5 w-5" /> New topic
        </Button>
      </Card>
    </div>
  );
}

/* ---------------------------- Pieces ---------------------------- */

function Intro() {
  return (
    <div>
      <h1 className="font-display text-3xl font-black leading-tight">Switch Sides</h1>
      <p className="text-plum-soft">Great arguers can argue both ways. Then they pick a winner.</p>
    </div>
  );
}

function StepDot({ className, children }: { className: string; children: string }) {
  return (
    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black text-white ${className}`}>{children}</span>
  );
}

function PointField({
  side,
  index,
  value,
  autoFocus,
  onChange,
}: {
  side: Side;
  index: number;
  value: string;
  autoFocus: boolean;
  onChange: (value: string) => void;
}) {
  const id = `${side}-point-${index}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
        Point {index + 1}
      </label>
      <textarea
        id={id}
        autoFocus={autoFocus}
        className={`field min-h-[76px] ${side === "for" ? "focus:border-tang" : "focus:border-iris"}`}
        placeholder={side === "for" ? "One reason this is a good idea…" : "One reason this is a bad idea…"}
        value={value}
        maxLength={180}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PointChooser({
  title,
  side,
  points,
  selected,
  onSelect,
  onAdd,
}: {
  title: string;
  side: Side;
  points: Pair;
  selected: number;
  onSelect: (index: number) => void;
  onAdd: (value: string) => void;
}) {
  const filled = points.map((text, index) => ({ text, index })).filter((p) => p.text.trim());
  const accent = side === "for" ? "border-tang bg-tang/10" : "border-iris bg-iris/10";
  return (
    <Card className="space-y-2">
      <p className="font-display text-lg font-extrabold">{title}</p>
      {filled.length === 0 ? (
        <>
          <p className="text-sm text-plum-soft">The clock beat you on this side. Add one point now:</p>
          <textarea className="field min-h-[70px]" value={points[0]} maxLength={180} onChange={(e) => onAdd(e.target.value)} />
        </>
      ) : (
        <div className="space-y-2" role="radiogroup" aria-label={title}>
          {filled.map(({ text, index }) => (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={selected === index}
              onClick={() => onSelect(index)}
              className={`flex w-full items-start gap-2 rounded-xl border-2 p-3 text-left text-sm font-semibold transition ${selected === index ? accent : "border-plum/10 bg-white"}`}
            >
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${selected === index ? "border-plum bg-plum text-white" : "border-plum/25"}`}>
                {selected === index && <Check className="h-3 w-3" strokeWidth={4} />}
              </span>
              {text}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function Slot({ text, empty, className }: { text: string; empty: string; className: string }) {
  if (!text) return <span className="rounded-md bg-plum/5 px-1 italic text-plum/35">{empty}</span>;
  return <span className={`rounded-md px-1 ${className}`}>{text}</span>;
}
