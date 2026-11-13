import {
  GRADE_SCALE,
  scoreToGrade,
  type GradeInfo,
  type Grades,
} from "./grading";

/** What the user typed for each course code, kept as-is so it shows back. */
export type Entries = Partial<Record<string, string>>;

export type ParsedGrade =
  | { ok: true; grade: GradeInfo; source: "score" | "grade" }
  | { ok: false; error: string };

/**
 * One box accepts any of:
 * - a letter grade: "A-", "b+"
 * - a grade point from the scale: "3.75", "4", "0"
 * - a Canvas score out of 100: "93.5" (a trailing "%" forces this)
 *
 * Canvas shows the raw score (the handbook's "Point Ranges" column), so it
 * goes through scoreToGrade(), not the transmuted % column.
 */
export function parseGradeInput(text: string): ParsedGrade | null {
  let value = text.trim();
  if (value === "") return null;

  const letter = GRADE_SCALE.find(
    (g) => g.letter.toLowerCase() === value.toLowerCase(),
  );
  if (letter) return { ok: true, grade: letter, source: "grade" };

  const forcedScore = value.endsWith("%");
  if (forcedScore) value = value.slice(0, -1).trim();

  if (!/^\d+(\.\d+)?$/.test(value)) {
    return { ok: false, error: "Not a grade" };
  }
  const n = Number(value);

  if (!forcedScore) {
    const point = GRADE_SCALE.find((g) => g.point === n);
    if (point) return { ok: true, grade: point, source: "grade" };
    // 3.6 isn't on the scale, and nobody's Canvas grade is 3.6
    if (n < 4) return { ok: false, error: "Not on scale" };
  }

  if (n > 100) return { ok: false, error: "Max is 100" };
  return { ok: true, grade: scoreToGrade(n), source: "score" };
}

/** Grade points for every entry that parses. */
export function resolveGrades(entries: Entries): Grades {
  const grades: Grades = {};
  for (const [code, text] of Object.entries(entries)) {
    const parsed = parseGradeInput(text ?? "");
    if (parsed?.ok) grades[code] = parsed.grade.point;
  }
  return grades;
}
