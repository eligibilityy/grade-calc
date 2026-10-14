import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GRADE_SCALE } from "@/lib/grading";

export function GradeScaleTable() {
  return (
    <>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="pb-2 font-normal">Score</th>
            <th className="pb-2 font-normal">Grade</th>
            <th className="pb-2 font-normal">Letter</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {GRADE_SCALE.map((g, i) => {
            const upper = i === 0 ? 100 : GRADE_SCALE[i - 1].minScore - 1;
            return (
              <tr key={g.letter} className="border-t border-dashed">
                <td className="py-2">
                  {g.minScore}–{upper}
                </td>
                <td className="py-2 font-medium">{g.point.toFixed(2)}</td>
                <td
                  className={g.point === 0 ? "py-2 text-destructive" : "py-2"}
                >
                  {g.letter}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        Scores are rounded to the nearest whole number. 60 is the lowest passing
        score.
      </p>
    </>
  );
}

export function GradeScaleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade scale</CardTitle>
      </CardHeader>
      <CardContent>
        <GradeScaleTable />
      </CardContent>
    </Card>
  );
}
