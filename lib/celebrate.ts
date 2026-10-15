"use client";

import { playChime } from "./sound";

export const CELEBRATE_EVENT = "persuado:celebrate";

/** Fires the confetti layer and the success chime. */
export function celebrate(options: { sound?: boolean } = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CELEBRATE_EVENT));
  if (options.sound !== false) playChime();
}
