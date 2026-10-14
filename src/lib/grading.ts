import type { Course } from "./types";

/**
 * Conversion table straight from Handbook
 */
export const GRADE_SCALE = [
  { point: 4.0, letter: "A", minScore: 96, percent: "98–100%" },
  { point: 3.75, letter: "A-", minScore: 92, percent: "95–97%" },
  { point: 3.5, letter: "B+", minScore: 87, percent: "92–94%" },
  { point: 3.25, letter: "B", minScore: 82, percent: "89–91%" },
  { point: 3.0, letter: "B-", minScore: 77, percent: "86–88%" },
  { point: 2.75, letter: "C+", minScore: 72, percent: "83–85%" },
  { point: 2.5, letter: "C", minScore: 68, percent: "80–82%" },
  { point: 2.25, letter: "C-", minScore: 63, percent: "77–79%" },
  { point: 2.0, letter: "D", minScore: 60, percent: "76%" },
  { point: 0, letter: "F", minScore: 0, percent: "65–74%" },
] as const;

export type GradeInfo = (typeof GRADE_SCALE)[number];

export type GradePoint = GradeInfo["point"];

export const PASSING_SCORE = 60;

export function isGradePoint(value: unknown): value is GradePoint {
  return GRADE_SCALE.some((g) => g.point === value);
}

export function gradeInfo(point: GradePoint): GradeInfo {
  return GRADE_SCALE.find((g) => g.point === point)!;
}

export function roundScore(score: number): number {
  return Math.round(Math.round(score * 1e6) / 1e6);
}

export function scoreToGrade(score: number): GradeInfo {
  const rounded = roundScore(score);
  return (
    GRADE_SCALE.find((g) => rounded >= g.minScore) ??
    GRADE_SCALE[GRADE_SCALE.length - 1]
  );
}

/**
 * Grading system ng college is 40% gt 60% majors, 30% split btwn midterm and final
 */
export const WEIGHTS = { gts: 40, midterm: 30, final: 30 } as const;

export interface Score {
  earned: number;
  max: number;
}

export function pooledFraction(scores: Score[]): number | null {
  const max = scores.reduce((sum, s) => sum + s.max, 0);
  if (max <= 0) return null;
  const earned = scores.reduce((sum, s) => sum + s.earned, 0);
  return earned / max;
}

export interface CourseScoreParts {
  gts: number | null;
  midterm: number | null;
  final: number | null;
}

/** Points each component contributes toward the 100-point course score */
export function courseScoreParts(
  gts: Score[],
  midterm: Score | null,
  final: Score | null,
): CourseScoreParts {
  const gtFraction = pooledFraction(gts);
  return {
    gts: gtFraction === null ? null : gtFraction * WEIGHTS.gts,
    midterm: midterm ? (midterm.earned / midterm.max) * WEIGHTS.midterm : null,
    final: final ? (final.earned / final.max) * WEIGHTS.final : null,
  };
}

export interface FinalTarget {
  grade: GradeInfo;
  /** Percent needed on the final exam, from 0 to 100 */
  neededPercent: number;
  status: "secured" | "possible" | "out-of-reach";
}

/**
 * For each passing grade, the final exam percent needed to reach it given
 * the GT and midterm points so far
 */
export function finalExamTargets(pointsSoFar: number): FinalTarget[] {
  return GRADE_SCALE.filter((g) => g.minScore >= PASSING_SCORE).map((grade) => {
    const pointsNeeded = grade.minScore - 0.5 - pointsSoFar;
    const neededPercent = (pointsNeeded / WEIGHTS.final) * 100;
    const status =
      neededPercent <= 0
        ? "secured"
        : neededPercent > 100
          ? "out-of-reach"
          : "possible";
    return { grade, neededPercent: Math.max(0, neededPercent), status };
  });
}

/** Grade per course code */
export type Grades = Partial<Record<string, GradePoint>>;

export interface GwaOptions {
  includePathfit: boolean;
  includePracticum: boolean;
}

export const DEFAULT_GWA_OPTIONS: GwaOptions = {
  includePathfit: true,
  includePracticum: true,
};

export function countsTowardGwa(course: Course, options: GwaOptions): boolean {
  switch (course.type ?? "regular") {
    case "regular":
      return true;
    case "nstp":
      return false;
    case "pathfit":
      return options.includePathfit;
    case "practicum":
      return options.includePracticum;
  }
}

export interface GwaResult {
  gwa: number | null;
  unitsTaken: number;
  unitsLeft: number;
}

export function computeGwa(
  courses: Course[],
  grades: Grades,
  options: GwaOptions,
): GwaResult {
  let weightedSum = 0;
  let unitsTaken = 0;
  let unitsLeft = 0;

  for (const course of courses) {
    if (!countsTowardGwa(course, options)) continue;
    const grade = grades[course.code];
    if (grade === undefined) {
      unitsLeft += course.units;
    } else {
      weightedSum += grade * course.units;
      unitsTaken += course.units;
    }
  }

  return {
    gwa: unitsTaken > 0 ? weightedSum / unitsTaken : null,
    unitsTaken,
    unitsLeft,
  };
}

// TODO: Consider rounding to 2 decimal places but keep unrounded for calculations
export function roundGwa(gwa: number): number {
  return Math.round(gwa * 100) / 100;
}

/**
 * Needed GWA to reach target GWA given current GWA and remaining units
 *
 * Gets? nuggets
 */
export type TargetResult =
  | { kind: "no-units-left" }
  | { kind: "already-met" }
  | { kind: "needed"; value: number }
  | { kind: "out-of-reach"; value: number };

export function targetGwa(result: GwaResult, target: number): TargetResult {
  const { gwa, unitsTaken, unitsLeft } = result;
  if (unitsLeft === 0) return { kind: "no-units-left" };

  const pointsSoFar = (gwa ?? 0) * unitsTaken;
  const needed = (target * (unitsTaken + unitsLeft) - pointsSoFar) / unitsLeft;

  if (needed <= 0) return { kind: "already-met" };
  if (needed > 4) return { kind: "out-of-reach", value: needed };
  return { kind: "needed", value: needed };
}

/** Flatten courses. */
export function allCourses(
  years: { semesters: { courses: Course[] }[] }[],
): Course[] {
  return years.flatMap((y) => y.semesters.flatMap((s) => s.courses));
}
