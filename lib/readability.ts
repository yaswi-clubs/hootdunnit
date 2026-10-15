/** Shared text rules used by the offline coach, the AI route and the PEEL checks. */

export const MAX_REPLY_WORDS = 39; // "fewer than 40 words"
export const MAX_READING_GRADE = 8; // US grade 8 = roughly Year 9 / end of KS3

const WORD_RE = /[A-Za-z0-9][A-Za-z0-9'’-]*/g;

export function words(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

export function countWords(text: string): number {
  return words(text).length;
}

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch-Kincaid grade level. Good enough to catch "too wordy for a 11-year-old". */
export function readingGrade(text: string): number {
  const list = words(text);
  if (list.length === 0) return 0;
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length);
  const syllables = list.reduce((sum, w) => sum + countSyllables(w), 0);
  return 0.39 * (list.length / sentences) + 11.8 * (syllables / list.length) - 15.59;
}

/** Hard word cap. Prefers cutting at a sentence end so the reply still reads naturally. */
export function limitWords(text: string, max: number = MAX_REPLY_WORDS): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const tokens = clean.split(" ");
  if (countWords(clean) <= max) return clean;

  const kept: string[] = [];
  let wordTotal = 0;
  for (const token of tokens) {
    const n = countWords(token);
    if (wordTotal + n > max) break;
    kept.push(token);
    wordTotal += n;
  }
  const cut = kept.join(" ");
  const lastEnd = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  const sentenceCut = lastEnd > -1 ? cut.slice(0, lastEnd + 1) : "";
  if (sentenceCut && countWords(sentenceCut) >= 10) return sentenceCut;
  return `${cut.replace(/[,;:\s]+$/, "")}…`;
}
