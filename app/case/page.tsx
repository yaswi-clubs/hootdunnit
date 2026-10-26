import { Suspense } from "react";
import CaseHub from "@/components/CaseHub";

export const metadata = { title: "Case file | Hootdunnit" };

export default function CasePage() {
  return (
    <Suspense fallback={<div className="h-64" aria-busy="true" />}>
      <CaseHub />
    </Suspense>
  );
}
