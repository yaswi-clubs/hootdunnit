import { CAST } from "./cast";
import { otherView, type Case, type ViewKey } from "./data";
import { countWords, limitWords } from "./readability";
import type { Hunch } from "./types";

/** Hoot asks three curious questions. Never more than 40 words a turn. */
export const HOOT_ROUNDS = 3;

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export function witnessName(c: Case, view: ViewKey): string {
  return CAST[c.views[view].who].name;
}

export function hootGreeting(c: Case, detective: string): string {
  return `Hoo-hoo, ${detective}! New case: ${c.question} What's your hunch?`;
}

export function hunchLabel(c: Case, hunch: Hunch): string {
  if (hunch === "both") return "A bit of both!";
  return `${c.views[hunch].stance}, like ${witnessName(c, hunch)}`;
}

export function firstQuestion(c: Case, hunch: Hunch): string {
  if (hunch === "both") {
    return pick([
      "Ooh, a bit of both! That's very fair-minded. What do you like about each idea?",
      "Both? A detective who sees every side! Which part of each idea do you like best?",
    ]);
  }
  const name = witnessName(c, hunch);
  return pick([
    `You and ${name} agree! What's your best reason? Clues love a "because".`,
    `Interesting! ${name} thinks so too. Why do you think that?`,
  ]);
}

interface Rule {
  id: string;
  test: (text: string) => string | null;
  reply: (hit: string, c: Case, hunch: Hunch) => string;
}

const match = (re: RegExp) => (text: string) => text.match(re)?.[0] ?? null;

/** Order = priority. Every reply is warm first, then asks one curious question. */
const RULES: Rule[] = [
  {
    id: "short",
    test: (t) => (countWords(t) < 4 ? "short" : null),
    reply: () =>
      pick([
        "Ooh, a mystery in itself! Can you tell me a little more? What made you think that?",
        "I'm all ears! Well, all feathers. Can you add a bit more about why?",
      ]),
  },
  {
    id: "absolute",
    test: match(/\b(always|never|everyone|everybody|nobody|no one|all|every|none|nothing)\b/i),
    reply: (hit) =>
      `"${hit.toLowerCase()}" is a big word! Can you think of anyone who might feel differently? Would your idea still work for them?`,
  },
  {
    id: "fact",
    test: match(/\b(most|study|research|scientists?|experts?|percent|fact)\b|%|\d+/i),
    reply: () =>
      pick([
        "A fact! Brilliant detective work. How could we check it's true? Where might we look?",
        "Ooh, that sounds like a real clue. Who could we ask to make sure it's right?",
      ]),
  },
  {
    id: "feeling",
    test: match(/\b(fun|boring|love|hate|like|annoying|cool|awesome|amazing|happy|sad|cosy|cozy|nice|best|favourite|favorite)\b/i),
    reply: () =>
      pick([
        "That's a real feeling, and feelings count! Is there a fact that backs it up too? Peek at the clues if you like.",
        "I can tell you really feel that! Could a fact make your idea even stronger?",
      ]),
  },
  {
    id: "because",
    test: (t) => (/\b(because|so|since|as|means)\b/i.test(t) ? null : "no-because"),
    reply: () =>
      pick([
        `Love it! Can you add a "because" to it? Reasons are the very best clues.`,
        `Great start! Why is that? Try finishing: "...because..."`,
      ]),
  },
];

/** Reply to her first answer. */
export function hootFollowUp(text: string, c: Case, hunch: Hunch): string {
  for (const rule of RULES) {
    const hit = rule.test(text);
    if (hit) return limitWords(rule.reply(hit, c, hunch));
  }
  const view: ViewKey = hunch === "both" ? pick<ViewKey>(["a", "b"]) : otherView(hunch);
  const clue = pick(c.clues.filter((cl) => cl.view === view));
  return limitWords(`Clever thinking! Here's a clue ${witnessName(c, view)} found: "${clue.text}" How does that fit with your idea?`);
}

/** Reply to her second answer: praise, then the "other shoes" question. */
export function hootPerspective(c: Case, hunch: Hunch): string {
  const praise = pick(["Hoo! That's good thinking.", "Ooh, I'm writing that in my notebook.", "Very clever, detective!"]);
  if (hunch === "both") {
    return `${praise} Last question: if you had to pick just one, which would it be, and why?`;
  }
  const other = witnessName(c, otherView(hunch));
  return `${praise} Last question: what's one good thing about ${other}'s idea? Try on their shoes!`;
}

export function hootWrapUp(c: Case, hunch: Hunch): string {
  if (hunch === "both") {
    return "Case notes complete! You looked at both sides really carefully. That's what the best detectives do.";
  }
  const other = witnessName(c, otherView(hunch));
  return `What a kind answer! ${other} would be so happy you listened. Case notes complete. You're ready to write your report!`;
}
