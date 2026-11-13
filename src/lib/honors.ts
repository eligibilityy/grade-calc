import type { Course } from "./types";
import type { GradePoint, Grades } from "./grading";

export interface HonorRule {
  name: string;
  minGwa: number;
  minGrade: GradePoint;
  handbook: string;
}

/* Source: DLSL handbook orientation slides (2026), sections V and W */

export const DEANS_LIST: HonorRule[] = [
  {
    name: "Dean's List: 1st Honors",
    minGwa: 3.75,
    minGrade: 3.5,
    handbook: "GPA of 3.7500 or better, no grade lower than 3.50",
  },
  {
    name: "Dean's List: 2nd Honors",
    minGwa: 3.5,
    minGrade: 3.25,
    handbook: "GPA of 3.5000 or better, no grade lower than 3.25",
  },
  {
    name: "Dean's List: 3rd Honors",
    minGwa: 3.25,
    minGrade: 3.0,
    handbook: "GPA of 3.2500 or better, no grade lower than 3.00",
  },
];

export const GRADUATION_HONORS: HonorRule[] = [
  {
    name: "Summa Cum Laude",
    minGwa: 3.75,
    minGrade: 3.5,
    handbook: "Cumulative GPA of 3.7500 or higher, no grade lower than 3.50",
  },
  {
    name: "Magna Cum Laude",
    minGwa: 3.5,
    minGrade: 3.25,
    handbook: "Cumulative GPA of 3.5000 to 3.7499, no grade lower than 3.25",
  },
  {
    name: "Cum Laude",
    minGwa: 3.25,
    minGrade: 3.0,
    handbook: "Cumulative GPA of 3.2500 to 3.4999, no grade lower than 3.00",
  },
];

/** The handbook states GPAs to four decimals: a 3.7450 is Magna, not Summa */
export function honorGwa(gwa: number): number {
  return Math.round(gwa * 1e4) / 1e4;
}

export function lowestGrade(
  courses: Course[],
  grades: Grades,
): GradePoint | null {
  let lowest: GradePoint | null = null;
  for (const course of courses) {
    const grade = grades[course.code];
    if (grade !== undefined && (lowest === null || grade < lowest))
      lowest = grade;
  }
  return lowest;
}

export function bestHonor(
  rules: HonorRule[],
  gwa: number | null,
  lowest: GradePoint | null,
): HonorRule | null {
  if (gwa === null || lowest === null) return null;
  return rules.find((r) => gwa >= r.minGwa && lowest >= r.minGrade) ?? null;
}

export function blockedHonors(
  rules: HonorRule[],
  lowest: GradePoint | null,
): HonorRule[] {
  if (lowest === null) return [];
  return rules.filter((r) => lowest < r.minGrade);
}

/** The closest still-possible tier above `current` (rules are best first) */
export function nextHonor(
  rules: HonorRule[],
  current: HonorRule | null,
  lowest: GradePoint | null,
): HonorRule | null {
  const end = current ? rules.indexOf(current) : rules.length;
  const blocked = blockedHonors(rules, lowest);
  const open = rules.slice(0, end).filter((r) => !blocked.includes(r));
  return open.at(-1) ?? null;
}
