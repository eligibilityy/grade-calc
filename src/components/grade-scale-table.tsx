import { GRADE_SCALE } from "@/lib/grading";
import { cn } from "@/lib/utils";

const CELL = "h-[38px] px-3 text-left whitespace-nowrap";

export function GradeScaleTable() {
  return (
    <>
      <div className="overflow-x-auto overscroll-x-contain rounded-xl [scrollbar-width:none]">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="bg-ink-2">
              {["Canvas score", "Transmuted", "Grade", "Letter"].map((h) => (
                <th key={h} className={cn(CELL, "font-medium text-ink-12")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GRADE_SCALE.map((g, i) => {
              const upper = i === 0 ? 100 : GRADE_SCALE[i - 1].minScore - 1;
              const failing = g.point === 0;
              return (
                <tr
                  key={g.letter}
                  className={cn(
                    "border-b-[0.5px] border-line last:border-b-0",
                    failing ? "text-[var(--red-11)]" : "text-ink-11",
                  )}
                >
                  <td className={cn(CELL, !failing && "text-ink-12")}>
                    {g.minScore}–{upper}
                  </td>
                  <td className={CELL}>{g.percent}</td>
                  <td className={CELL}>{g.point.toFixed(2)}</td>
                  <td className={CELL}>{g.letter}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-11">
        Type the score Canvas shows. It&apos;s rounded to a whole number, then
        matched to this table.
      </p>
    </>
  );
}
