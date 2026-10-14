"use client";

import type { ReactNode } from "react";
import { Calligraph } from "calligraph";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  GRADE_SCALE,
  countsTowardGwa,
  type GradePoint,
  type Grades,
  type GwaOptions,
} from "@/lib/grading";
import type { Course } from "@/lib/types";
import { Panel, Stat, StatRow } from "./primitives";
import { formatGwa, type SemesterSummary } from "./summary";

const GRADE_ITEMS = [
  { label: "No grade", value: null },
  ...GRADE_SCALE.map((g) => ({
    label: `${g.point.toFixed(2)} (${g.letter})`,
    value: g.point,
  })),
];

interface SemesterPanelProps {
  summary: SemesterSummary;
  grades: Grades;
  options: GwaOptions;
  onGradeChange: (code: string, grade: GradePoint | null) => void;
}

export function SemesterPanel({
  summary,
  grades,
  options,
  onGradeChange,
}: SemesterPanelProps) {
  const {
    semester,
    yearName,
    gwa,
    unitsTaken,
    unitsLeft,
    complete,
    deansList,
  } = summary;

  return (
    <Panel>
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{yearName}</p>
          <h3 className="text-xl font-medium tracking-tight">
            {semester.name}
          </h3>
        </div>
        {deansList && (
          <span className="animate-in fade-in-0 zoom-in-95 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground duration-300">
            Dean&apos;s List
          </span>
        )}
      </header>

      <StatRow className="my-4">
        <Stat label="GWA">
          <Calligraph variant="number">{formatGwa(gwa)}</Calligraph>
        </Stat>
        <Stat label="Units graded">
          {unitsTaken}/{unitsTaken + unitsLeft}
        </Stat>
        <Stat label="Dean's List">
          {deansList
            ? deansList.name.replace("Dean's List: ", "")
            : complete
              ? "Not this time"
              : "Pending"}
        </Stat>
      </StatRow>

      <ul className="-mx-2">
        {semester.courses.map((course) => (
          <CourseRow
            key={course.code}
            course={course}
            grade={grades[course.code] ?? null}
            counted={countsTowardGwa(course, options)}
            onGradeChange={(grade) => onGradeChange(course.code, grade)}
          />
        ))}
      </ul>
    </Panel>
  );
}

interface CourseRowProps {
  course: Course;
  grade: GradePoint | null;
  counted: boolean;
  onGradeChange: (grade: GradePoint | null) => void;
}

function CourseRow({ course, grade, counted, onGradeChange }: CourseRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-200 hover:bg-muted/60">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium">{course.code}</span>
          {!counted && <Chip>Not in GWA</Chip>}
          {course.note && <Chip>{course.note}</Chip>}
        </div>
        <p
          className="truncate text-sm text-muted-foreground"
          title={course.title}
        >
          {course.title}
        </p>
      </div>
      <span className="w-8 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {course.units}u
      </span>
      <Select items={GRADE_ITEMS} value={grade} onValueChange={onGradeChange}>
        <SelectTrigger
          aria-label={`Grade for ${course.code}`}
          className={cn(
            "w-[7.25rem] shrink-0 rounded-full px-3.5 transition-colors duration-200 data-[size=default]:h-9",
            // Ungraded: dashed outline. Graded: soft grey fill.
            grade === null
              ? "border-dashed bg-transparent text-muted-foreground hover:bg-card"
              : "border-transparent bg-muted font-medium",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-2xl p-1">
          {GRADE_ITEMS.map((item) => (
            <SelectItem
              key={item.label}
              value={item.value}
              className="rounded-xl py-1.5"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </li>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
