"use client";

import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { countsTowardGwa, type GwaOptions } from "@/lib/grading";
import type { Entries } from "@/lib/grade-input";
import { formatGwa, type SemesterSummary } from "@/lib/summary";
import { GradeInput } from "./grade-input";

interface YearSectionProps {
  name: string;
  gwa: number | null;
  semesters: SemesterSummary[];
  entries: Entries;
  options: GwaOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryChange: (code: string, value: string) => void;
}

export function YearSection({
  name,
  gwa,
  semesters,
  entries,
  options,
  open,
  onOpenChange,
  onEntryChange,
}: YearSectionProps) {
  return (
    <Collapsible.Root
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-[28px] bg-card"
    >
      <Collapsible.Trigger className="group flex w-full items-center gap-3 rounded-[28px] px-5 py-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-7 sm:py-5">
        <ChevronDownIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-0 -rotate-90 motion-reduce:transition-none" />
        <span className="flex-1 text-lg font-medium tracking-tight">
          {name}
        </span>
        <span className="text-sm text-muted-foreground">GWA</span>
        <span className="w-10 text-right font-medium tabular-nums">
          {formatGwa(gwa)}
        </span>
      </Collapsible.Trigger>

      <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none">
        <div className="space-y-6 px-3 pb-5 sm:px-5 sm:pb-6">
          {semesters.map((s) => (
            <SemesterBlock
              key={s.key}
              summary={s}
              entries={entries}
              options={options}
              onEntryChange={onEntryChange}
            />
          ))}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function SemesterBlock({
  summary,
  entries,
  options,
  onEntryChange,
}: {
  summary: SemesterSummary;
  entries: Entries;
  options: GwaOptions;
  onEntryChange: (code: string, value: string) => void;
}) {
  const { semester, gwa, complete, deansList } = summary;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed px-2 pb-2">
        <h3 className="font-medium">{semester.name}</h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatGwa(gwa)}
        </span>
        <span className="ml-auto">
          {deansList ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground animate-in fade-in-0 zoom-in-95 duration-300">
              Dean&apos;s List · {deansList.name.replace("Dean's List: ", "")}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {complete ? "No Dean's List" : "Dean's List pending"}
            </span>
          )}
        </span>
      </div>

      <ul className="mt-1">
        {semester.courses.map((course) => {
          const counted = countsTowardGwa(course, options);
          return (
            <li
              key={course.code}
              className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors duration-200 hover:bg-muted/50"
            >
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
                  {course.units} {course.units === 1 ? "unit" : "units"} ·{" "}
                  {course.title}
                </p>
              </div>
              <GradeInput
                label={`Grade for ${course.code}`}
                value={entries[course.code] ?? ""}
                onChange={(value) => onEntryChange(course.code, value)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}
