import { CONNECTOR_WORDS, PEEL_KEYS, type PeelKey } from "./data";
import { countWords } from "./readability";

export const PEEL_DRAFT_KEY = "persuado:peel-draft";
export const MIN_PART_WORDS = 3;

export interface PeelDraft {
  title: string;
  parts: Record<PeelKey, string>;
  step: number;
}

export const EMPTY_PEEL_DRAFT: PeelDraft = {
  title: "",
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
  "should", "would", "could", "every", "allowed", "there", "their", "about", "which", "being", "students", "have", "with",
]);

function keyWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

export interface PeelCheck {
  key: PeelKey;
  label: string;
  ok: boolean;
}

export function evaluatePeel(title: string, parts: Record<PeelKey, string>): PeelCheck[] {
  const lowerExplain = parts.explanation.toLowerCase();
  const titleWords = keyWords(title).map((w) => w.slice(0, 5));
  const linkWords = keyWords(parts.link).map((w) => w.slice(0, 5));
  const sentences = (parts.point.match(/[.!?]+(\s|$)/g) ?? []).length;

  return [
    {
      key: "point",
      label: "Point is short and clear",
      ok: countWords(parts.point) >= 5 && countWords(parts.point) <= 30 && sentences <= 1,
    },
    {
      key: "evidence",
      label: "Evidence has a fact, number or example",
      ok: /\d|for example|for instance|according|research|survey|study|such as|expert|scientist/i.test(parts.evidence),
    },
    {
      key: "explanation",
      label: "Explanation uses a connector",
      ok: CONNECTOR_WORDS.some((w) => lowerExplain.includes(w.toLowerCase().replace(/,$/, ""))),
    },
    {
      key: "link",
      label: "Link uses words from the question",
      ok: titleWords.length > 0 && linkWords.some((w) => titleWords.includes(w)),
    },
  ];
}
