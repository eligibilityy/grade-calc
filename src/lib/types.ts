/**
 * How a course is treated in GWA calculations:
 * - regular:   always counts
 * - nstp:      never counts toward GWA, but still checked for honors
 * - pathfit:   counts by default, boolean toggle to remove from gwa
 * - practicum: same case as pathfit
 */
export type CourseType = "regular" | "nstp" | "pathfit" | "practicum";

export interface Course {
  code: string;
  title: string;
  units: number;
  lec: number;
  lab: number;
  prereqs: string[];
  type?: CourseType;
  note?: string;
}

export interface Semester {
  name: string;
  courses: Course[];
}

export interface YearLevel {
  year: string;
  semesters: Semester[];
}

export interface Curriculum {
  id: string;
  school: string;
  program: string;
  effective: string;
  years: YearLevel[];
}
