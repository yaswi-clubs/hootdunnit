"use client";

import { useState } from "react";
import { ChevronDown, Shuffle } from "lucide-react";
import { TOPICS, randomTopic, type Topic } from "@/lib/data";
import { playPop } from "@/lib/sound";
import { Button, Card, Pill } from "./ui";

export default function TopicPicker({ topic, onChange }: { topic: Topic; onChange: (topic: Topic) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-peach text-2xl" aria-hidden="true">
          {topic.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <Pill>{topic.category}</Pill>
          <h2 className="mt-1 font-display text-xl font-extrabold leading-tight">{topic.motion}</h2>
          <p className="text-sm text-plum-soft">{topic.question}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            playPop();
            onChange(randomTopic(topic.id));
          }}
        >
          <Shuffle className="h-4 w-4" /> Shuffle
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          Choose a topic <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>
      {open && (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun ${t.id === topic.id ? "bg-sun" : "bg-peach hover:bg-peach-deep"}`}
              >
                <span aria-hidden="true">{t.emoji}</span>
                {t.motion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
