"use client";

import { readStorage } from "./storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "./settings";

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function soundOn(): boolean {
  return readStorage(SETTINGS_KEY, DEFAULT_SETTINGS).sound !== false;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !soundOn()) return null;
  const AC = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType,
  volume = 0.12,
  slideTo?: number,
) {
  const start = ac.currentTime + startOffset;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Gentle "hmm, try again" wobble. */
export function playHmm(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 440, 0, 0.16, "sine", 0.08);
  tone(ac, 392, 0.14, 0.22, "sine", 0.07);
}

/** Bright two-note "you found it!" */
export function playDing(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 880, 0, 0.18, "triangle", 0.1);
  tone(ac, 1318.5, 0.08, 0.3, "triangle", 0.1);
}

/** Rising arpeggio for a solved case. */
export function playChime(): void {
  const ac = audio();
  if (!ac) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, f, i * 0.09, 0.35, "triangle", 0.12));
}

/** Soft pop for taps and inserts. */
export function playPop(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 520, 0, 0.09, "sine", 0.1, 880);
}
