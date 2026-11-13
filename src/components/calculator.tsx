"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRICULA, getCurriculum } from "@/data/curricula";
import { useStoredState } from "@/hooks/use-stored-state";
import { resolveGrades, type Entries } from "@/lib/grade-input";
import {
  DEFAULT_GWA_OPTIONS,
  allCourses,
  computeGwa,
  isGradePoint,
  type GwaOptions,
} from "@/lib/grading";
import {
  GRADUATION_HONORS,
  bestHonor,
  honorGwa,
  lowestGrade,
} from "@/lib/honors";
import { ProgressiveBlur } from "@/lib/progressive-blur/react";
import { summarizeSemesters } from "@/lib/summary";
import { GwaControls } from "./gwa-controls";
import { InfoDialog } from "./info-dialog";
import { StatusCard } from "./status-card";
import { YearSection } from "./year-section";

function isEntries(value: unknown): value is Entries {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((v) => typeof v === "string")
  );
}

function isGwaOptions(value: unknown): value is GwaOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as GwaOptions).includePathfit === "boolean" &&
    typeof (value as GwaOptions).includePracticum === "boolean"
  );
}

function isCurriculumId(value: unknown): value is string {
  return typeof value === "string" && getCurriculum(value) !== undefined;
}

const NO_ENTRIES: Entries = {};

/**
 * The first version stored grade points under `grades:<id>`. Copy them into
 * the new key once, then drop the old one so "Clear all" stays cleared.
 */
function migrateLegacyGrades(curriculumId: string): Entries | null {
  try {
    const oldKey = `grades:${curriculumId}`;
    const raw = localStorage.getItem(oldKey);
    if (raw === null) return null;
    localStorage.removeItem(oldKey);
    if (localStorage.getItem(`entries:${curriculumId}`) !== null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const entries: Entries = {};
    for (const [code, point] of Object.entries(parsed)) {
      if (isGradePoint(point)) entries[code] = point.toFixed(2);
    }
    return entries;
  } catch {
    return null;
  }
}

export function Calculator() {
  const [curriculumId, setCurriculumId] = useStoredState(
    "curriculum",
    CURRICULA[0].id,
    isCurriculumId,
  );
  const curriculum = getCurriculum(curriculumId) ?? CURRICULA[0];

  const [entries, setEntries] = useStoredState<Entries>(
    `entries:${curriculum.id}`,
    NO_ENTRIES,
    isEntries,
  );
  const [options, setOptions] = useStoredState<GwaOptions>(
    "gwa-options",
    DEFAULT_GWA_OPTIONS,
    isGwaOptions,
  );
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const migrated = migrateLegacyGrades(curriculum.id);
    if (migrated) setEntries(migrated);
  }, [curriculum.id, setEntries]);

  const grades = resolveGrades(entries);
  const courses = allCourses(curriculum.years);
  const result = computeGwa(courses, grades, options);
  const lowest = lowestGrade(courses, grades);
  const honor = bestHonor(
    GRADUATION_HONORS,
    result.gwa === null ? null : honorGwa(result.gwa),
    lowest,
  );
  const semesters = summarizeSemesters(curriculum, grades, options);

  const currentYear = curriculum.years.findIndex((y) =>
    y.semesters.some((s) =>
      s.courses.some((c) => grades[c.code] === undefined),
    ),
  );

  function setEntry(code: string, value: string) {
    setEntries((prev) => {
      const next = { ...prev };
      if (value.trim() === "") delete next[code];
      else next[code] = value;
      return next;
    });
  }

  return (
    <>
      <header className="sticky top-0 z-30">
        <ProgressiveBlur
          side="top"
          className="absolute inset-x-0 top-0 h-[calc(100%+40px)]"
        />
        <div className="relative mx-auto flex w-full max-w-3xl items-center gap-2 px-4 pt-8 pb-4 lg:max-w-6xl">
          <div className="mr-auto leading-tight">
            <p className="font-medium">GWA Calculator</p>
            <a
              href="https://yiliya.studio"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              yiliya.studio
            </a>
          </div>
          {CURRICULA.length > 1 && (
            <CurriculumPicker
              value={curriculum.id}
              onChange={setCurriculumId}
            />
          )}
          <InfoDialog honor={honor} />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-10 lg:max-w-6xl lg:pt-10">
        <div className="grid gap-3 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className="space-y-3 lg:sticky lg:top-32">
            <StatusCard
              program={`${curriculum.program} · ${curriculum.effective}`}
              result={result}
              honor={honor}
              lowest={lowest}
              semesters={semesters}
            />
            <GwaControls
              options={options}
              onOptionsChange={setOptions}
              hasGrades={Object.keys(entries).length > 0}
              onClear={() => setEntries({})}
            />
          </aside>

          <main className="min-w-0 space-y-3">
            {curriculum.years.map((year, i) => (
              <YearSection
                key={`${curriculum.id}-${year.year}`}
                name={year.year}
                gwa={
                  computeGwa(
                    year.semesters.flatMap((s) => s.courses),
                    grades,
                    options,
                  ).gwa
                }
                semesters={semesters.filter((s) => s.yearIndex === i)}
                entries={entries}
                options={options}
                open={openYears[year.year] ?? i === Math.max(currentYear, 0)}
                onOpenChange={(open) =>
                  setOpenYears((prev) => ({ ...prev, [year.year]: open }))
                }
                onEntryChange={setEntry}
              />
            ))}

            <p className="px-2 pt-3 text-xs text-muted-foreground">
              Type the score Canvas shows (like 93.5), or your final grade point
              (3.75) or letter (A-). These are estimates, so confirm with the
              registrar.
            </p>
          </main>
        </div>
      </div>
    </>
  );
}

function CurriculumPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const items = CURRICULA.map((c) => ({
    label: c.short ?? c.program,
    value: c.id,
  }));
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(id) => {
        if (typeof id === "string") onChange(id);
      }}
    >
      <SelectTrigger aria-label="Curriculum" className="rounded-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-2xl p-1">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="rounded-xl"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
