export default function ProgressBadge({ week }: { week: number }) {
  const pct = Math.min(100, Math.max(0, (week / 40) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium">Week {week}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[--color-primary] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
