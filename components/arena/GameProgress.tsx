export function GameProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Clue ${index + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2.5 flex-1 rounded-full transition ${i < index ? "bg-leaf" : i === index ? "bg-sun" : "bg-plum/10"}`} />
      ))}
    </div>
  );
}
