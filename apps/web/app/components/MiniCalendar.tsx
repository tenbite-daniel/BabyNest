"use client";
import { useMemo } from "react";

type Props = {
  current: Date;
  onPrev: () => void;
  onNext: () => void;
};

export default function MiniCalendar({ current, onPrev, onNext }: Props) {
  const { grid, monthLabel } = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const label = current.toLocaleString(undefined, { month: "long", year: "numeric" });
    return { grid: cells, monthLabel: label };
  }, [current]);

  return (
    <div className="border border-[--color-secondary]/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrev} className="px-2 py-1 rounded hover:bg-gray-100">‹</button>
        <div className="font-semibold">{monthLabel}</div>
        <button onClick={onNext} className="px-2 py-1 rounded hover:bg-gray-100">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {["S","M","T","W","T","F","S"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {grid.map((d, i) => (
          <div
            key={i}
            className={`h-8 flex items-center justify-center rounded ${d ? "bg-pink-50" : ""}`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
