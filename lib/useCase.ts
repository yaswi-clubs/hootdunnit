"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { caseOfTheDay, getCase, type Case } from "./data";
import { useSettings } from "./settings";

/**
 * The case named in ?id=, or today's case if there isn't one.
 * Null until the browser has loaded settings. Pages using this must sit inside <Suspense>.
 */
export function useCaseParam(): Case | null {
  const params = useSearchParams();
  const id = params.get("id");
  const { settings, hydrated } = useSettings();
  const categoriesKey = settings.categories.join(",");
  return useMemo(
    () => (hydrated ? (getCase(id) ?? caseOfTheDay(settings.categories)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hydrated, id, categoriesKey],
  );
}

export function caseHref(path: string, id: string, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams({ id, ...extra });
  return `${path}?${q.toString()}`;
}
