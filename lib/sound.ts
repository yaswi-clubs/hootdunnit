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

/** Game-show buzzer for "switch sides". */
export function playBuzzer(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 196, 0, 0.55, "sawtooth", 0.09);
  tone(ac, 147, 0, 0.55, "square", 0.05);
}

/** Rising arpeggio for a finished paragraph or debate. */
export function playChime(): void {
  const ac = audio();
  if (!ac) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, f, i * 0.09, 0.35, "triangle", 0.12));
}

/** Short tick for the last seconds of a timer. */
export function playTick(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 1200, 0, 0.06, "square", 0.04);
}

/** Soft pop for taps and inserts. */
export function playPop(): void {
  const ac = audio();
  if (!ac) return;
  tone(ac, 520, 0, 0.09, "sine", 0.1, 880);
}
