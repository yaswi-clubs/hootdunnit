import { countWords } from "./readability";

export interface SynthesisInput {
  /** The point being answered (goes after "While it is argued that"). */
  against: string;
  /** The winning point. */
  forPoint: string;
  reason: string;
}

export const SYNTHESIS_TEMPLATE = {
  open: "While it is argued that ",
  middle: ", a more compelling point is that ",
  because: " because ",
  close: ".",
} as const;

const LEAD_INS =
  /^(it is argued that|some people (say|think|argue|believe)( that)?|people (say|think|argue)( that)?|i think( that)?|i believe( that)?|while|although)\s+/i;
const JOINERS = /^(that|because|since|as)\s+/i;

/**
 * Turns a child's free-typed point into a clause that drops cleanly into the
 * template: trims, removes end punctuation, strips duplicated lead-ins like
 * "because" or "I think", and lowercases a sentence-style capital.
 */
export function toClause(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim().replace(/[\s.!?;:,…]+$/, "");
  let previous = "";
  while (previous !== s) {
    previous = s;
    s = s.replace(LEAD_INS, "").replace(JOINERS, "");
  }
  if (/^[A-Z][a-z]/.test(s)) s = s.charAt(0).toLowerCase() + s.slice(1);
  return s;
}

export function synthesisParts(input: SynthesisInput) {
  return {
    against: toClause(input.against),
    forPoint: toClause(input.forPoint),
    reason: toClause(input.reason),
  };
}

export function buildSynthesis(input: SynthesisInput): string {
  const p = synthesisParts(input);
  const t = SYNTHESIS_TEMPLATE;
  return `${t.open}${p.against}${t.middle}${p.forPoint}${t.because}${p.reason}${t.close}`;
}

export function isSynthesisReady(input: SynthesisInput): boolean {
  const p = synthesisParts(input);
  return countWords(p.against) >= 2 && countWords(p.forPoint) >= 2 && countWords(p.reason) >= 2;
}
