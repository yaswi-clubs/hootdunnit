"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Check, Lock, Play, RotateCcw, Send, Shuffle, Swords, Target, Trophy, X } from "lucide-react";
import { TOPICS, getTopic, opposite, randomTopic, topicIdFromUrl } from "@/lib/data";
import type { ChatMessage, Side } from "@/lib/types";
import { useLocalStorage } from "@/lib/storage";
import { useProgress } from "@/lib/progress";
import { celebrate } from "@/lib/celebrate";
import { playPop } from "@/lib/sound";
import { SPAR_ROUNDS, assessTurn, mockRebuttal, type CoachReply } from "@/lib/sparring";
import { uid } from "@/lib/uid";
import { wait } from "@/lib/format";
import TopicPicker from "@/components/TopicPicker";
import { Button, Card, Pill } from "@/components/ui";

const SPAR_KEY = "persuado:spar";
const MAX_INPUT = 240;

interface SparSession {
  topicId: string;
  userSide: Side;
  status: "setup" | "live" | "finished";
  messages: ChatMessage[];
  usedRules: string[];
  usedCounterpoints: number[];
  xp: number;
}

const NEW_SESSION: SparSession = {
  topicId: TOPICS[0].id,
  userSide: "for",
  status: "setup",
  messages: [],
  usedRules: [],
  usedCounterpoints: [],
  xp: 0,
};

/** Offline coach: runs entirely in the browser, so nothing typed leaves the device. */
async function getCoachReply(session: SparSession, userText: string): Promise<CoachReply> {
  const topic = getTopic(session.topicId) ?? TOPICS[0];
  await wait(650 + Math.random() * 650);
  return mockRebuttal({
    userText,
    topic,
    aiSide: opposite(session.userSide),
    usedRules: session.usedRules,
    usedCounterpoints: session.usedCounterpoints,
  });
}

export default function SparringPartner() {
  const [session, setSession, hydrated] = useLocalStorage<SparSession>(SPAR_KEY, NEW_SESSION);
  const { record } = useProgress();
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const topic = getTopic(session.topicId) ?? TOPICS[0];
  const aiSide = opposite(session.userSide);
  const userTurns = session.messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    if (!hydrated) return;
    const fromUrl = getTopic(topicIdFromUrl());
    if (fromUrl && session.status === "setup") setSession((s) => ({ ...s, topicId: fromUrl.id }));
    else if (session.status === "setup" && session.topicId === NEW_SESSION.topicId) setSession((s) => ({ ...s, topicId: randomTopic().id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session.messages.length, thinking]);

  const start = () => {
    playPop();
    setSession((s) => {
      const t = getTopic(s.topicId) ?? TOPICS[0];
      return {
        ...s,
        status: "live",
        messages: [{ id: uid(), role: "coach", text: t.openings[opposite(s.userSide)] }],
        usedRules: [],
        usedCounterpoints: [],
        xp: 0,
      };
    });
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || thinking || session.status !== "live") return;
    const userMessage: ChatMessage = { id: uid(), role: "user", text };
    const snapshot = session;
    setSession((s) => ({ ...s, messages: [...s.messages, userMessage] }));
    setDraft("");
    setThinking(true);

    const result = await getCoachReply(snapshot, text);
    const coachMessage: ChatMessage = { id: uid(), role: "coach", text: result.reply, assumption: result.assumption || undefined };
    const finishing = userTurns + 1 >= SPAR_ROUNDS;
    let earned = 0;
    if (finishing) {
      earned = record("spar", topic.motion, `Argued ${session.userSide.toUpperCase()} for ${SPAR_ROUNDS} rounds`);
      celebrate();
    }

    setSession((s) => ({
      ...s,
      messages: [...s.messages, coachMessage],
      usedRules: result.ruleId ? [...s.usedRules, result.ruleId] : s.usedRules,
      usedCounterpoints:
        result.counterpointIndex !== undefined ? [...s.usedCounterpoints, result.counterpointIndex] : s.usedCounterpoints,
      status: finishing ? "finished" : s.status,
      xp: finishing ? earned : s.xp,
    }));
    setThinking(false);
  };

  const resetTo = (patch: Partial<SparSession>) => {
    setDraft("");
    setSession((s) => ({ ...NEW_SESSION, topicId: s.topicId, userSide: s.userSide, ...patch }));
  };

  /* ---------------------------- Setup ---------------------------- */
  if (session.status === "setup") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-black leading-tight">Sparring Partner</h1>
          <p className="text-plum-soft">Three rounds against Coach. Every reply challenges one idea in what you said.</p>
        </div>

        <TopicPicker topic={topic} onChange={(t) => setSession((s) => ({ ...s, topicId: t.id }))} />

        <Card className="space-y-3">
          <p className="font-display text-lg font-extrabold">Pick your side</p>
          <div className="grid grid-cols-2 gap-2">
            {(["for", "against"] as Side[]).map((side) => (
              <Button
                key={side}
                variant={session.userSide === side ? side : "secondary"}
                aria-pressed={session.userSide === side}
                onClick={() => setSession((s) => ({ ...s, userSide: side }))}
              >
                {side === "for" ? "FOR" : "AGAINST"}
              </Button>
            ))}
          </div>
          <p className="text-sm text-plum-soft">Coach argues {aiSide === "for" ? "FOR" : "AGAINST"}.</p>
        </Card>

        <p className="flex items-center gap-2 px-1 text-sm text-plum-soft">
          <Lock className="h-4 w-4 shrink-0" /> Coach runs on this device. Nothing you type is sent anywhere.
        </p>

        <Button size="lg" className="w-full" onClick={start}>
          <Play className="h-5 w-5" fill="currentColor" /> Start sparring
        </Button>
      </div>
    );
  }

  /* ---------------------------- Live / finished ---------------------------- */
  const userMessages = session.messages.filter((m) => m.role === "user");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-plum p-3 text-white">
        <Swords className="h-6 w-6 shrink-0 text-sun" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-extrabold">{topic.motion}</p>
          <p className="text-xs text-white/70">
            You: {session.userSide === "for" ? "FOR" : "AGAINST"}. Coach: {aiSide === "for" ? "FOR" : "AGAINST"}.
          </p>
        </div>
        <div className="flex gap-1" aria-label={`Round ${Math.min(userTurns + 1, SPAR_ROUNDS)} of ${SPAR_ROUNDS}`}>
          {Array.from({ length: SPAR_ROUNDS }, (_, i) => (
            <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < userTurns ? "bg-sun" : "bg-white/25"}`} />
          ))}
        </div>
        {session.status === "live" && (
          <button type="button" onClick={() => resetTo({})} className="rounded-full p-1 hover:bg-white/10" aria-label="End debate">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <ol className="space-y-3" aria-live="polite">
        {session.messages.map((m) => (
          <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "coach" ? (
              <div className="flex max-w-[88%] gap-2">
                <span className={`mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${aiSide === "for" ? "bg-tang" : "bg-iris"}`}>
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-tl-md bg-white p-3 shadow-soft motion-safe:animate-pop">
                  <p className="leading-relaxed">{m.text}</p>
                  {m.assumption && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-sun/30 px-2 py-1.5 text-xs font-semibold">
                      <Target className="mt-px h-3.5 w-3.5 shrink-0" />
                      Challenging: {m.assumption}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`max-w-[85%] rounded-2xl rounded-tr-md p-3 text-white ${session.userSide === "for" ? "bg-tang" : "bg-iris"}`}>
                <p className="leading-relaxed">{m.text}</p>
              </div>
            )}
          </li>
        ))}
        {thinking && (
          <li className="flex items-center gap-2 text-plum-soft" aria-label="Coach is typing">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-plum/10">
              <Bot className="h-4 w-4" />
            </span>
            <span className="flex gap-1 rounded-2xl bg-white px-3 py-3 shadow-soft">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-plum/40 motion-safe:animate-bounce3" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </li>
        )}
      </ol>

      {session.status === "live" ? (
        <form
          className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex items-end gap-2 rounded-2xl bg-white p-2 shadow-soft"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="spar-input" className="sr-only">
            Your rebuttal
          </label>
          <textarea
            id="spar-input"
            rows={2}
            className="max-h-32 min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-base outline-none placeholder:text-plum/35"
            placeholder="Hit back with a reason…"
            value={draft}
            maxLength={MAX_INPUT}
            disabled={thinking}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button type="submit" variant={session.userSide} className="h-11 w-11 shrink-0 px-0" disabled={!draft.trim() || thinking} aria-label="Send">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      ) : (
        <Card className="space-y-3 motion-safe:animate-pop">
          <div className="text-center">
            <Trophy className="mx-auto h-10 w-10 text-sun-dark" />
            <h2 className="font-display text-2xl font-black">Debate complete!</h2>
            <Pill className="bg-sun text-plum">+{session.xp} XP</Pill>
          </div>
          <div className="space-y-2">
            <p className="font-display font-extrabold">How you argued</p>
            {userMessages.map((m, i) => (
              <div key={m.id} className="rounded-xl bg-peach p-3">
                <p className="mb-1.5 text-xs font-bold text-plum-soft">Round {i + 1}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {assessTurn(m.text).map((f) => (
                    <li key={f.label} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${f.ok ? "bg-leaf text-white" : "bg-white text-plum/45"}`}>
                      {f.ok ? <Check className="h-3 w-3" strokeWidth={4} /> : null}
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => resetTo({ userSide: aiSide })}>
              <RotateCcw className="h-4 w-4" /> Swap sides
            </Button>
            <Button onClick={() => resetTo({ topicId: randomTopic(topic.id).id })}>
              <Shuffle className="h-4 w-4" /> New topic
            </Button>
          </div>
        </Card>
      )}
      <div ref={endRef} />
    </div>
  );
}
