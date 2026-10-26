"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronLeft, RotateCcw, Send, Shuffle } from "lucide-react";
import { CAST } from "@/lib/cast";
import { randomCase, type Case } from "@/lib/data";
import { firstQuestion, hootFollowUp, hootGreeting, hootPerspective, hootWrapUp, hunchLabel } from "@/lib/hoot";
import { useLocalStorage } from "@/lib/storage";
import { useProgress } from "@/lib/progress";
import { detectiveName, useSettings } from "@/lib/settings";
import { celebrate } from "@/lib/celebrate";
import { playPop } from "@/lib/sound";
import { caseHref, useCaseParam } from "@/lib/useCase";
import { countWords } from "@/lib/readability";
import { uid } from "@/lib/uid";
import { wait } from "@/lib/format";
import type { ChatMessage, Hunch } from "@/lib/types";
import { Avatar, Button, Card, Pill, VIEW_TONE } from "@/components/ui";

type Stage = "hunch" | "q1" | "q2" | "q3" | "done";

interface Chat {
  stage: Stage;
  hunch: Hunch | null;
  messages: ChatMessage[];
  answers: string[];
}

const CHAT_KEY = "hootdunnit:hoot-chats";

export default function AskHoot() {
  const c = useCaseParam();
  if (!c) return <div className="h-64" aria-busy="true" />;
  return <HootChat key={c.id} c={c} />;
}

function HootChat({ c }: { c: Case }) {
  const router = useRouter();
  const { settings } = useSettings();
  const { record } = useProgress();
  const [chats, setChats, hydrated] = useLocalStorage<Record<string, Chat>>(CHAT_KEY, {});
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [cluesOpen, setCluesOpen] = useState(false);
  const [earned, setEarned] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const fresh = (): Chat => ({
    stage: "hunch",
    hunch: null,
    answers: [],
    messages: [{ id: uid(), role: "hoot", text: hootGreeting(c, detectiveName(settings)) }],
  });
  const chat = chats[c.id] ?? fresh();
  const save = (next: Chat) => setChats((all) => ({ ...all, [c.id]: next }));

  useEffect(() => {
    if (hydrated && !chats[c.id]) save(fresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, c.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages.length, typing]);

  const hootReplies = async (base: Chat, reply: string, stage: Stage) => {
    setTyping(true);
    await wait(700 + Math.min(900, reply.length * 12));
    setTyping(false);
    playPop();
    const next: Chat = { ...base, stage, messages: [...base.messages, { id: uid(), role: "hoot", text: reply }] };
    save(next);
    return next;
  };

  const pickHunch = async (hunch: Hunch) => {
    if (typing) return;
    const base: Chat = { ...chat, hunch, messages: [...chat.messages, { id: uid(), role: "you", text: hunchLabel(c, hunch) }] };
    save(base);
    await hootReplies(base, firstQuestion(c, hunch), "q1");
  };

  const send = async () => {
    const answer = text.trim();
    if (!answer || typing || !chat.hunch) return;
    setText("");
    const base: Chat = {
      ...chat,
      answers: [...chat.answers, answer],
      messages: [...chat.messages, { id: uid(), role: "you", text: answer }],
    };
    save(base);
    if (chat.stage === "q1") await hootReplies(base, hootFollowUp(answer, c, chat.hunch), "q2");
    else if (chat.stage === "q2") await hootReplies(base, hootPerspective(c, chat.hunch), "q3");
    else if (chat.stage === "q3") {
      await hootReplies(base, hootWrapUp(c, chat.hunch), "done");
      const points = record({ caseId: c.id, step: "hoot", hunch: chat.hunch, summary: base.answers[0] ?? "Chatted with Hoot" });
      setEarned(points);
      celebrate();
    }
  };

  const restart = () => {
    setEarned(null);
    save(fresh());
  };

  if (!hydrated) return <div className="h-64" aria-busy="true" />;

  const round = chat.stage === "q1" ? 1 : chat.stage === "q2" ? 2 : chat.stage === "q3" ? 3 : null;

  return (
    <div className="space-y-4">
      <Link href={caseHref("/case/", c.id)} className="inline-flex items-center gap-1 text-sm font-bold text-plum-soft">
        <ChevronLeft className="h-4 w-4" /> {c.title}
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-black leading-tight">Ask Hoot</h1>
          <p className="text-plum-soft">Share your hunch. Hoot asks curious questions.</p>
        </div>
        <Button variant="secondary" size="sm" aria-label="Different case" onClick={() => router.push(caseHref("/spar/", randomCase(settings.categories, c.id).id))}>
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>

      <Card className="p-0">
        <button
          type="button"
          onClick={() => setCluesOpen((o) => !o)}
          aria-expanded={cluesOpen}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sun"
        >
          <span aria-hidden="true">{c.emoji}</span>
          <span className="flex-1">Peek at the clues</span>
          <ChevronDown className={`h-5 w-5 transition ${cluesOpen ? "rotate-180" : ""}`} />
        </button>
        {cluesOpen && (
          <ul className="space-y-1.5 px-4 pb-4">
            {c.clues.map((cl) => (
              <li key={cl.id} className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${VIEW_TONE[cl.view].soft}`}>
                <span aria-hidden="true">{CAST[c.views[cl.view].who].emoji}</span>
                {cl.text}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {round && (
        <p className="text-center text-xs font-bold text-plum-soft">
          Question {round} of 3
        </p>
      )}

      <ul className="space-y-3" aria-live="polite">
        {chat.messages.map((m) =>
          m.role === "hoot" ? (
            <li key={m.id} className="flex items-start gap-2 motion-safe:animate-pop">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-plum text-xl" aria-hidden="true">
                🦉
              </span>
              <p className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-snug shadow-soft">{m.text}</p>
            </li>
          ) : (
            <li key={m.id} className="flex justify-end motion-safe:animate-pop">
              <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-sun px-4 py-3 text-[15px] font-semibold leading-snug">{m.text}</p>
            </li>
          ),
        )}
        {typing && (
          <li className="flex items-center gap-2" aria-label="Hoot is thinking">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-plum text-xl" aria-hidden="true">
              🦉
            </span>
            <span className="flex gap-1 rounded-2xl bg-white px-4 py-4 shadow-soft">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-plum/40 motion-safe:animate-bounce3" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </li>
        )}
      </ul>

      {chat.stage === "hunch" && !typing && (
        <div className="grid gap-2">
          {(["a", "b"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => pickHunch(v)}
              className={`flex items-center gap-3 rounded-2xl border-4 bg-white p-3 text-left transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${VIEW_TONE[v].border}`}
            >
              <Avatar who={c.views[v].who} view={v} size="sm" />
              <span className="font-display text-lg font-extrabold">{c.views[v].stance}</span>
              <span className="ml-auto text-xs font-bold text-plum-soft">like {CAST[c.views[v].who].name}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => pickHunch("both")}
            className="flex items-center gap-3 rounded-2xl border-4 border-leaf bg-white p-3 text-left transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf/15 text-xl" aria-hidden="true">
              🤝
            </span>
            <span className="font-display text-lg font-extrabold">A bit of both!</span>
          </button>
        </div>
      )}

      {(chat.stage === "q1" || chat.stage === "q2" || chat.stage === "q3") && (
        <form
          className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex items-end gap-2 rounded-2xl bg-peach/95 py-2 backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="hoot-answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="hoot-answer"
            className="field min-h-[52px] flex-1"
            rows={2}
            maxLength={300}
            placeholder="Type your answer…"
            value={text}
            disabled={typing}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button type="submit" className="h-[52px] w-[52px] shrink-0 px-0" disabled={typing || countWords(text) === 0} aria-label="Send">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      )}

      {chat.stage === "done" && !typing && (
        <Card className="space-y-3 motion-safe:animate-pop">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 font-display text-xl font-extrabold">📓 Your case notes</h2>
            {earned !== null && <Pill className="bg-sun text-plum">+{earned} pts</Pill>}
          </div>
          {chat.hunch && (
            <p className="text-sm">
              <span className="font-bold">My hunch:</span> {hunchLabel(c, chat.hunch)}
            </p>
          )}
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {chat.answers.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
          <Link
            href={caseHref("/peel/", c.id)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-leaf font-display font-bold text-white shadow-leaf transition active:translate-y-[3px] active:shadow-none"
          >
            📁 Write your Case Report <ArrowRight className="h-5 w-5" />
          </Link>
          <Button variant="secondary" className="w-full" onClick={restart}>
            <RotateCcw className="h-4 w-4" /> Chat again
          </Button>
        </Card>
      )}
      <div ref={endRef} />
    </div>
  );
}
