import { Suspense } from "react";
import PeelBuilder from "@/components/peel/PeelBuilder";

export const metadata = { title: "Case Report | Persuado" };

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="h-64" aria-busy="true" />}>
      <PeelBuilder />
    </Suspense>
  );
}
