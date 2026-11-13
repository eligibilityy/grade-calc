import {
  GRADE_SCALE,
  scoreToGrade,
  type GradeInfo,
  type Grades,
} from "./grading";

export type Entries = Partial<Record<string, string>>;

export type ParsedGrade =
  | { ok: true; grade: GradeInfo; source: "score" | "grade" }
  | { ok: false; error: string };

/**
 * Accepts a letter ("A-"), a grade point ("3.75") or a Canvas score ("93.5";
 * a trailing "%" forces a score). Canvas shows the raw score (the handbook's
 * "Point Ranges" column), not the transmuted %.
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
    return { ok: false, error: "Not a valid grade" };
  }
  const n = Number(value);

  if (!forcedScore) {
    const point = GRADE_SCALE.find((g) => g.point === n);
    if (point) return { ok: true, grade: point, source: "grade" };
    // 3.6 isn't on the scale, and nobody's Canvas grade is 3.6
    if (n < 4) return { ok: false, error: "Not on the scale" };
  }

  if (n > 100) return { ok: false, error: "Over 100" };
  return { ok: true, grade: scoreToGrade(n), source: "score" };
}

export function resolveGrades(entries: Entries): Grades {
  const grades: Grades = {};
  for (const [code, text] of Object.entries(entries)) {
    const parsed = parseGradeInput(text ?? "");
    if (parsed?.ok) grades[code] = parsed.grade.point;
  }
  return grades;
}
