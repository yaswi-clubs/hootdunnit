import { CAST } from "./cast";
import { CONNECTOR_WORDS, PEEL_KEYS, type Case, type PeelKey } from "./data";
import { countWords } from "./readability";

export const PEEL_DRAFT_KEY = "hootdunnit:report-drafts";
export const MIN_PART_WORDS = 3;

export interface PeelDraft {
  parts: Record<PeelKey, string>;
  step: number;
}

/** One draft per case, so she can hop between cases without losing work. */
export type PeelDrafts = Record<string, PeelDraft>;

export const EMPTY_PEEL_DRAFT: PeelDraft = {
  parts: { point: "", evidence: "", explanation: "", link: "" },
  step: 0,
};

export function isPartReady(text: string): boolean {
  return countWords(text) >= MIN_PART_WORDS;
}

/** Capitalises the first letter and makes sure the part ends with punctuation. */
export function finaliseSentence(raw: string): string {
  const s = raw.replace(/\s+/g, " ").trim();
  if (!s) return "";
  const capped = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?…"”')]$/.test(capped) ? capped : `${capped}.`;
}

export function buildParagraph(parts: Record<PeelKey, string>): string {
  return PEEL_KEYS.map((k) => finaliseSentence(parts[k])).filter(Boolean).join(" ");
}

function lowerFirst(s: string): string {
  if (/^I\b/.test(s)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Inserts a connector/stem at the caret with sensible spacing and capitals. */
export function insertAtCaret(current: string, caret: number, snippet: string): { value: string; caret: number } {
  const pos = Math.max(0, Math.min(caret, current.length));
  const before = current.slice(0, pos);
  const after = current.slice(pos);
  const trimmedBefore = before.trimEnd();
  const atSentenceStart = trimmedBefore === "" || /[.!?]$/.test(trimmedBefore);
  const text = atSentenceStart ? snippet : lowerFirst(snippet);
  const spaceBefore = before.length > 0 && !/\s$/.test(before) ? " " : "";
  const spaceAfter = after.length === 0 || !/^\s/.test(after) ? " " : "";
  const head = `${before}${spaceBefore}${text}${spaceAfter}`;
  return { value: `${head}${after}`, caret: head.length };
}

const STOP_WORDS = new Set([
  "should", "would", "could", "every", "allowed", "there", "their", "about", "which", "being", "have", "with", "rather", "better",
]);

function keyWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

export interface PeelCheck {
  key: PeelKey | "kind";
  label: string;
  ok: boolean;
  bonus?: boolean;
}

const KIND_NOD = /\b(even though|although|though|on the other hand|some people|others|i can see why|i understand|while|whereas)\b/i;

/** True when the report mentions the other idea kindly (or names a witness). */
export function hasKindNod(c: Case, parts: Record<PeelKey, string>): boolean {
  const all = PEEL_KEYS.map((k) => parts[k]).join(" ");
  const names = [CAST[c.views.a.who].name, CAST[c.views.b.who].name];
  return KIND_NOD.test(all) || names.some((n) => new RegExp(`\\b${n}\\b`, "i").test(all));
}

export function evaluatePeel(c: Case, parts: Record<PeelKey, string>): PeelCheck[] {
  const lowerExplain = parts.explanation.toLowerCase();
  const titleWords = keyWords(c.question).map((w) => w.slice(0, 5));
  const linkWords = keyWords(`${parts.link} ${parts.point}`).map((w) => w.slice(0, 5));
  const clueTexts = c.clues.map((cl) => cl.text.toLowerCase().slice(0, 18));

  return [
    {
      key: "point",
      label: "Your hunch is clear",
      ok: countWords(parts.point) >= 4 && countWords(parts.point) <= 35,
    },
    {
      key: "evidence",
      label: "Your clue has a fact or example",
      ok:
        /\d|for example|for instance|such as|i noticed|research|scientists?|experts?/i.test(parts.evidence) ||
        clueTexts.some((t) => parts.evidence.toLowerCase().includes(t)),
    },
    {
      key: "explanation",
      label: "You explain how it fits",
      ok: countWords(parts.explanation) >= 4 && CONNECTOR_WORDS.some((w) => lowerExplain.includes(w.toLowerCase().replace(/,$/, ""))),
    },
    {
      key: "link",
      label: "You answer the case question",
      ok: titleWords.length > 0 && linkWords.some((w) => titleWords.includes(w)),
    },
    {
      key: "kind",
      label: "Bonus: a kind nod to the other idea",
      ok: hasKindNod(c, parts),
      bonus: true,
    },
  ];
}
