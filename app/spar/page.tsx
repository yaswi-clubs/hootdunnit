import { Suspense } from "react";
import AskHoot from "@/components/spar/AskHoot";

export const metadata = { title: "Ask Hoot | Hootdunnit" };

export default function HootPage() {
  return (
    <Suspense fallback={<div className="h-64" aria-busy="true" />}>
      <AskHoot />
    </Suspense>
  );
}
