import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Star } from "lucide-react";
import { CAST, type WitnessId } from "@/lib/cast";
import type { ViewKey } from "@/lib/data";

type Variant = "primary" | "a" | "b" | "leaf" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-plum text-white shadow-plum hover:bg-plum-soft",
  a: "bg-tang text-white shadow-tang hover:bg-tang-dark",
  b: "bg-iris text-white shadow-iris hover:bg-iris-dark",
  leaf: "bg-leaf text-white shadow-leaf hover:bg-leaf-dark",
  secondary: "bg-white text-plum border-2 border-plum/10 hover:border-plum/25",
  ghost: "bg-transparent text-plum hover:bg-plum/5",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-12 px-5 text-base gap-2 rounded-2xl",
  lg: "h-14 px-6 text-lg gap-2 rounded-2xl",
};

const PRESSABLE = new Set<Variant>(["primary", "a", "b", "leaf"]);

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const press = PRESSABLE.has(variant) ? "active:translate-y-[3px] active:shadow-none disabled:active:translate-y-0" : "";
  return (
    <button
      type={type}
      className={`inline-flex select-none items-center justify-center font-display font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${SIZES[size]} ${press} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-soft ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Pill({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${className || "bg-plum/5 text-plum-soft"}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, max, className = "", tone = "bg-sun" }: { value: number; max: number; className?: string; tone?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-plum/10 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`h-full rounded-full transition-[width] duration-500 ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stars({ value, max = 3, size = "h-5 w-5" }: { value: number; max?: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} className={`${size} ${i < value ? "fill-sun text-sun-dark" : "text-plum/20"}`} strokeWidth={2.25} />
      ))}
    </span>
  );
}

export const VIEW_TONE: Record<ViewKey, { ring: string; bg: string; soft: string; text: string; border: string }> = {
  a: { ring: "ring-tang", bg: "bg-tang", soft: "bg-tang/15", text: "text-tang-dark", border: "border-tang" },
  b: { ring: "ring-iris", bg: "bg-iris", soft: "bg-iris/15", text: "text-iris-dark", border: "border-iris" },
};

export function Avatar({ who, view, size = "md" }: { who: WitnessId; view?: ViewKey; size?: "sm" | "md" | "lg" }) {
  const w = CAST[who];
  const dims = size === "lg" ? "h-16 w-16 text-4xl" : size === "sm" ? "h-9 w-9 text-xl" : "h-12 w-12 text-2xl";
  const tone = view ? VIEW_TONE[view].soft : "bg-peach";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${dims} ${tone}`} role="img" aria-label={`${w.name} the ${w.animal}`}>
      {w.emoji}
    </span>
  );
}

export function HootSays({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-plum text-2xl" role="img" aria-label="Hoot the owl">
        🦉
      </span>
      <div className="relative rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[15px] leading-snug shadow-soft">{children}</div>
    </div>
  );
}

/** Small "back" header used on every inner screen. */
export function ScreenTitle({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div>
      {kicker && <p className="text-xs font-extrabold uppercase tracking-wider text-plum-soft">{kicker}</p>}
      <h1 className="font-display text-3xl font-black leading-tight">{title}</h1>
      {children && <p className="text-plum-soft">{children}</p>}
    </div>
  );
}
