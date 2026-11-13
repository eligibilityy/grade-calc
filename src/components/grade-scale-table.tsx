import { GRADE_SCALE } from "@/lib/grading";

export function GradeScaleTable() {
  return (
    <>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="pb-2 font-normal">Canvas score</th>
            <th className="pb-2 font-normal">Transmuted</th>
            <th className="pb-2 font-normal">Grade</th>
            <th className="pb-2 font-normal">Letter</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {GRADE_SCALE.map((g, i) => {
            const upper = i === 0 ? 100 : GRADE_SCALE[i - 1].minScore - 1;
            const failing = g.point === 0;
            return (
              <tr
                key={g.letter}
                className={
                  failing
                    ? "border-t border-dashed text-destructive"
                    : "border-t border-dashed"
                }
              >
                <td className="py-2">
                  {g.minScore}–{upper}
                </td>
                <td className="py-2 text-muted-foreground">{g.percent}</td>
                <td className="py-2 font-medium">{g.point.toFixed(2)}</td>
                <td className="py-2">{g.letter}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        Type the score Canvas shows. It&apos;s rounded to a whole number, then
        matched to this table.
      </p>
    </>
  );
}
