import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "for" | "against" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-plum text-white shadow-plum hover:bg-plum-soft",
  for: "bg-tang text-white shadow-tang hover:bg-tang-dark",
  against: "bg-iris text-white shadow-iris hover:bg-iris-dark",
  secondary: "bg-white text-plum border-2 border-plum/10 hover:border-plum/25",
  ghost: "bg-transparent text-plum hover:bg-plum/5",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-12 px-5 text-base gap-2 rounded-2xl",
  lg: "h-14 px-6 text-lg gap-2 rounded-2xl",
};

const PRESSABLE = new Set<Variant>(["primary", "for", "against"]);

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const press = PRESSABLE.has(variant)
    ? "active:translate-y-[3px] active:shadow-none disabled:active:translate-y-0"
    : "";
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

export function ProgressBar({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-plum/10 ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-sun transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
