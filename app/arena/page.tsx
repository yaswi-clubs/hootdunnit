import { Suspense } from "react";
import GamesHub from "@/components/arena/GamesHub";

export const metadata = { title: "Clue Games | Hootdunnit" };

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="h-64" aria-busy="true" />}>
      <GamesHub />
    </Suspense>
  );
}
