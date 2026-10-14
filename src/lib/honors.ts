import type { Course } from "./types";
import type { GradePoint, Grades } from "./grading";

export interface HonorRule {
  name: string;
  minGwa: number;
  minGrade: GradePoint;
  // Get notes straight frm handbook
  handbook: string;
}

export const DEANS_LIST: HonorRule[] = [
  {
    name: "Dean's List: 1st Honors",
    minGwa: 3.75,
    minGrade: 3.0,
    handbook: "Weighted average of 95% or better, no grade lower than 86%",
  },
  {
    name: "Dean's List: 2nd Honors",
    minGwa: 3.5,
    minGrade: 3.0,
    handbook: "Weighted average of 92% or better, no grade lower than 86%",
  },
  {
    name: "Dean's List: 3rd Honors",
    minGwa: 3.25,
    minGrade: 2.75,
    handbook: "Weighted average of 89% or better, no grade lower than 83%",
  },
];

export const GRADUATION_HONORS: HonorRule[] = [
  {
    name: "Summa Cum Laude",
    minGwa: 3.75,
    minGrade: 3.0,
    handbook: "GWA of 95% or better, no grade lower than 86%",
  },
  {
    name: "Magna Cum Laude",
    minGwa: 3.5,
    minGrade: 3.0,
    handbook: "GWA of 92% or better, no grade lower than 86%",
  },
  {
    name: "Cum Laude",
    minGwa: 3.25,
    minGrade: 2.75,
    handbook: "GWA of 89% or better, no grade lower than 83%",
  },
];

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
