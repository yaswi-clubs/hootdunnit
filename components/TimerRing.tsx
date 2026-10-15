import type { Side } from "@/lib/types";

export default function TimerRing({ remaining, total, side }: { remaining: number; total: number; side: Side }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const fraction = Math.max(0, Math.min(1, remaining / total));
  const urgent = remaining <= 10;
  const stroke = urgent ? "stroke-[#E5484D]" : side === "for" ? "stroke-tang" : "stroke-iris";

  return (
    <div className={`relative h-24 w-24 shrink-0 ${urgent ? "motion-safe:animate-wiggle" : ""}`} role="timer" aria-label={`${remaining} seconds left`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} className="fill-white stroke-plum/10" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={`fill-none transition-[stroke-dashoffset] duration-200 ease-linear ${stroke}`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-3xl font-black tabular-nums">{remaining}</span>
    </div>
  );
}
