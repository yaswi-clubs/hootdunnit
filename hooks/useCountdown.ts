"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wall-clock countdown (doesn't drift when the tab is throttled).
 * Changing `resetKey` resets the clock to `durationSec`.
 */
export function useCountdown(durationSec: number, running: boolean, onExpire: () => void, resetKey: unknown): number {
  const [remaining, setRemaining] = useState(durationSec);
  const remainingRef = useRef(durationSec);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    remainingRef.current = durationSec;
    setRemaining(durationSec);
  }, [resetKey, durationSec]);

  useEffect(() => {
    if (!running) return;
    const end = Date.now() + remainingRef.current * 1000;
    let fired = false;
    const id = window.setInterval(() => {
      const ms = Math.max(0, end - Date.now());
      remainingRef.current = ms / 1000;
      setRemaining(Math.ceil(ms / 1000));
      if (ms <= 0 && !fired) {
        fired = true;
        window.clearInterval(id);
        expireRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, resetKey]);

  return remaining;
}
