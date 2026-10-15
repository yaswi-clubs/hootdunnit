import type { Topic } from "./data";
import type { Side } from "./types";
import { countWords, limitWords, MAX_REPLY_WORDS } from "./readability";

export const SPAR_ROUNDS = 3;

export interface CoachReply {
  reply: string;
  assumption: string;
  ruleId?: string;
  counterpointIndex?: number;
}

export interface MockInput {
  userText: string;
  topic: Topic;
  aiSide: Side;
  usedRules: string[];
  usedCounterpoints: number[];
}

interface Rule {
  id: string;
  pattern: RegExp;
  assumption: (hit: string) => string;
  challenges: ((hit: string) => string)[];
}

/**
 * Each rule spots one kind of hidden assumption in the child's message and
 * challenges exactly that one. Order = priority.
 */
const RULES: Rule[] = [
  {
    id: "absolute",
    pattern: /\b(always|never|everyone|everybody|nobody|no one|all|every|none|nothing)\b/i,
    assumption: (hit) => `That "${hit}" is true for every single person`,
    challenges: [
      (hit) => `You said "${hit}". That's a big word! Can you think of one person it isn't true for? Does your point still work?`,
      (hit) => `"${hit}" leaves no room for exceptions. What if just a few people are different? Would that change your argument?`,
    ],
  },
  {
    id: "evidence",
    pattern: /\b(most|majority|studies|study|research|scientists|experts|statistics|percent)\b|%|\d+/i,
    assumption: () => "That your fact is definitely accurate",
    challenges: [
      () => "Where does that fact come from? A fact needs a source. What if another study found the opposite?",
      () => "That sounds like a fact, but how do we know it's true? Who found it out, and could they be wrong?",
    ],
  },
  {
    id: "feeling",
    pattern: /\b(boring|fun|hate|love|annoying|unfair|stupid|cool|awesome|horrible|sad|happy)\b/i,
    assumption: (hit) => `That everyone feels "${hit}" the same way you do`,
    challenges: [
      (hit) => `"${hit}" is a feeling. Feelings matter, but other people might feel differently. What reason would convince someone who disagrees?`,
      () => "That's how you feel, which is fair. But a judge wants reasons, not feelings. Can you turn it into a reason?",
    ],
  },
  {
    id: "cause",
    pattern: /\b(because|so|leads? to|causes?|makes?|means)\b/i,
    assumption: () => "That one thing directly causes the other",
    challenges: [
      () => "You're saying one thing causes another. Could something else be the real cause? How would you prove the link?",
      () => "Does that always happen, or only sometimes? If only sometimes, is it really the cause?",
    ],
  },
  {
    id: "should",
    pattern: /\b(should|must|need to|have to|ought to)\b/i,
    assumption: () => "That there is only one right thing to do",
    challenges: [
      () => "Who gets to decide what we should do? Maybe there's a middle option. Why is your choice the best one?",
      () => "Is there a smaller change that fixes the problem? Why go all the way instead?",
    ],
  },
  {
    id: "compare",
    pattern: /\b(better|worse|best|worst|safer|healthier|easier|harder)\b/i,
    assumption: (hit) => `That "${hit}" means the same thing for everyone`,
    challenges: [
      (hit) => `"${hit}" for who, though? Something can help one group and hurt another. Who might lose out with your idea?`,
    ],
  },
  {
    id: "prediction",
    pattern: /\b(will|would|could|might|going to)\b/i,
    assumption: () => "That your prediction will definitely happen",
    challenges: [
      () => "That's a prediction. How sure are you it would really happen? What could stop it?",
    ],
  },
];

const OPENERS = ["Interesting point.", "Okay, I hear you.", "Nice try!", "Hmm, good one.", "Fair, but wait."];
const COUNTER_QUESTIONS = ["How would you answer that?", "Does your point still win?", "What would you say to that?"];
const GENERIC = [
  "What's your strongest piece of evidence? A fact or real example would make this much harder to argue with.",
  "Imagine someone who totally disagrees. What one reason would change their mind?",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/** Offline coach. Always < 40 words and challenges exactly one assumption. */
export function mockRebuttal(input: MockInput): CoachReply {
  const text = input.userText.trim();

  if (countWords(text) < 4) {
    return {
      reply: limitWords(`${pick(OPENERS)} That's very short, though. Can you add a reason using "because"? Short answers are easy for me to knock down.`),
      assumption: "That a short answer is enough to convince people",
      ruleId: "short",
    };
  }

  const matches = RULES.map((rule) => {
    const m = text.match(rule.pattern);
    return m ? { rule, hit: m[0].toLowerCase() } : null;
  }).filter((m): m is { rule: Rule; hit: string } => m !== null);

  const freshMatch = matches.find((m) => !input.usedRules.includes(m.rule.id));
  const counterpoints = input.topic.counterpoints[input.aiSide];
  const unusedCounterpoints = counterpoints.map((_, i) => i).filter((i) => !input.usedCounterpoints.includes(i));
  const chosen = freshMatch ?? (unusedCounterpoints.length === 0 ? matches[0] : undefined);

  if (chosen) {
    return {
      reply: limitWords(`${pick(OPENERS)} ${pick(chosen.rule.challenges)(chosen.hit)}`, MAX_REPLY_WORDS),
      assumption: chosen.rule.assumption(chosen.hit),
      ruleId: chosen.rule.id,
    };
  }

  if (unusedCounterpoints.length > 0) {
    const index = unusedCounterpoints[0];
    return {
      reply: limitWords(`${pick(OPENERS)} But ${lowerFirst(counterpoints[index])} ${pick(COUNTER_QUESTIONS)}`, MAX_REPLY_WORDS),
      assumption: "That there's no strong point on the other side",
      counterpointIndex: index,
    };
  }

  return {
    reply: limitWords(`${pick(OPENERS)} ${pick(GENERIC)}`, MAX_REPLY_WORDS),
    assumption: "That your point needs no more proof",
  };
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export interface TurnFeedback {
  label: string;
  ok: boolean;
}

export function assessTurn(text: string): TurnFeedback[] {
  return [
    { label: "Gave a reason", ok: /\b(because|since|so|as a result|this means|therefore)\b/i.test(text) },
    { label: "Used evidence or an example", ok: /\d|for example|for instance|such as|according|research|study|survey/i.test(text) },
    { label: "Built a full argument", ok: countWords(text) >= 12 },
  ];
}
