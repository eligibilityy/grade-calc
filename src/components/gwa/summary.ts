import {
  computeGwa,
  roundGwa,
  type Grades,
  type GwaOptions,
} from "@/lib/grading";
import {
  DEANS_LIST,
  bestHonor,
  lowestGrade,
  type HonorRule,
} from "@/lib/honors";
import type { Curriculum, Semester } from "@/lib/types";

export interface SemesterSummary {
  key: string;
  yearIndex: number;
  semesterIndex: number;
  yearName: string;
  semester: Semester;
  gwa: number | null;
  unitsTaken: number;
  unitsLeft: number;
  complete: boolean;
  deansList: HonorRule | null;
}

export function summarizeSemesters(
  curriculum: Curriculum,
  grades: Grades,
  options: GwaOptions,
): SemesterSummary[] {
  return curriculum.years.flatMap((year, yearIndex) =>
    year.semesters.map((semester, semesterIndex) => {
      const { gwa, unitsTaken, unitsLeft } = computeGwa(
        semester.courses,
        grades,
        options,
      );
      const complete = semester.courses.every(
        (c) => grades[c.code] !== undefined,
      );
      // Determine Dean's List only after semester is complete
      const deansList = complete
        ? bestHonor(
            DEANS_LIST,
            gwa === null ? null : roundGwa(gwa),
            lowestGrade(semester.courses, grades),
          )
        : null;
      return {
        key: `${year.year}-${semester.name}`,
        yearIndex,
        semesterIndex,
        yearName: year.year,
        semester,
        gwa,
        unitsTaken,
        unitsLeft,
        complete,
        deansList,
      };
    }),
  );
}

export function formatGwa(gwa: number | null): string {
  return gwa === null ? "—" : roundGwa(gwa).toFixed(2);
}
