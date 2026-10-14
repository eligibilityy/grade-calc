"use client";

import { useEffect, useState } from "react";
import { useStoredState } from "@/hooks/use-stored-state";
import { cn } from "@/lib/utils";
import {
  DEFAULT_GWA_OPTIONS,
  allCourses,
  computeGwa,
  isGradePoint,
  roundGwa,
  type GradePoint,
  type Grades,
  type GwaOptions,
} from "@/lib/grading";
import { GRADUATION_HONORS, bestHonor, lowestGrade } from "@/lib/honors";
import type { Curriculum } from "@/lib/types";
import { Headline, OverviewPanel } from "./gwa/overview";
import { Panel, SectionLabel } from "./gwa/primitives";
import { SemesterPanel } from "./gwa/semester-panel";
import { SettingsList, TargetCard, YearNav, YearPills } from "./gwa/sidebar";
import { formatGwa, summarizeSemesters } from "./gwa/summary";
import { TopBar } from "./gwa/top-bar";

function isGrades(value: unknown): value is Grades {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every(isGradePoint)
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

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

const NO_GRADES: Grades = {};

interface GwaCalculatorProps {
  curriculum: Curriculum;
}

export function GwaCalculator({ curriculum }: GwaCalculatorProps) {
  const [grades, setGrades] = useStoredState<Grades>(
    `grades:${curriculum.id}`,
    NO_GRADES,
    isGrades,
  );
  const [options, setOptions] = useStoredState<GwaOptions>(
    "gwa-options",
    DEFAULT_GWA_OPTIONS,
    isGwaOptions,
  );
  const [selectedYear, setSelectedYear] = useState(0);
  const [target, setTarget] = useState("");

  const [sidebarOpen, setSidebarOpen] = useStoredState(
    "sidebar-open",
    true,
    isBoolean,
  );
  const [animate, setAnimate] = useState(false);

  function toggleSidebar() {
    setAnimate(true);
    setSidebarOpen((open) => !open);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "b" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setAnimate(true);
        setSidebarOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSidebarOpen]);

  const courses = allCourses(curriculum.years);
  const result = computeGwa(courses, grades, options);
  const lowest = lowestGrade(courses, grades);
  const honor = bestHonor(
    GRADUATION_HONORS,
    result.gwa === null ? null : roundGwa(result.gwa),
    lowest,
  );
  const semesters = summarizeSemesters(curriculum, grades, options);
  const years = curriculum.years.map((year) => ({
    name: year.year,
    gwa: computeGwa(
      year.semesters.flatMap((s) => s.courses),
      grades,
      options,
    ).gwa,
  }));

  function setGrade(code: string, grade: GradePoint | null) {
    setGrades((prev) => {
      const next = { ...prev };
      if (grade === null) delete next[code];
      else next[code] = grade;
      return next;
    });
  }

  const nav = { years, selected: selectedYear, onSelect: setSelectedYear };

  return (
    <>
      <TopBar
        school={curriculum.school}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      >
        <span className="rounded-full bg-card px-3 py-1.5 text-sm text-muted-foreground">
          GWA{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatGwa(result.gwa)}
          </span>
        </span>
      </TopBar>

      <div
        className={cn(
          "mx-auto w-full max-w-[1440px] px-3 pb-3 sm:px-4 sm:pb-4 lg:grid",
          sidebarOpen
            ? "lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-6"
            : "lg:grid-cols-[0rem_minmax(0,1fr)] lg:gap-0",
          animate &&
            "lg:transition-[grid-template-columns,column-gap] lg:duration-300 lg:ease-out motion-reduce:transition-none",
        )}
      >
        <aside
          id="app-sidebar"
          inert={!sidebarOpen}
          className={cn(
            "hidden overflow-clip lg:block",
            sidebarOpen ? "opacity-100" : "opacity-0",
            animate &&
              "transition-opacity duration-200 motion-reduce:transition-none",
          )}
        >
          <div className="sticky top-16 flex h-[calc(100dvh-5rem)] w-[17rem] flex-col gap-8 py-3">
            <nav className="space-y-2" aria-label="Year level">
              <SectionLabel>Curriculum</SectionLabel>
              <YearNav {...nav} />
            </nav>
            <div className="space-y-2">
              <SectionLabel>Settings</SectionLabel>
              <SettingsList options={options} onChange={setOptions} />
            </div>
            <div className="mt-auto">
              <TargetCard
                result={result}
                value={target}
                onValueChange={setTarget}
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <header className="space-y-2 px-1 py-4 sm:px-2 sm:py-8">
            <p className="text-sm text-muted-foreground">
              {curriculum.program} · {curriculum.effective}
            </p>
            <Headline result={result} honor={honor} />
          </header>

          <OverviewPanel
            result={result}
            lowest={lowest}
            honor={honor}
            semesters={semesters}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            hasGrades={Object.keys(grades).length > 0}
            onClear={() => setGrades({})}
          />

          <nav className="sticky top-19 z-20 lg:hidden" aria-label="Year level">
            <YearPills {...nav} />
          </nav>

          <div
            key={selectedYear}
            className="grid grid-cols-1 items-start gap-4 duration-500 ease-out animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none xl:grid-cols-2"
          >
            {semesters
              .filter((s) => s.yearIndex === selectedYear)
              .map((summary) => (
                <SemesterPanel
                  key={summary.key}
                  summary={summary}
                  grades={grades}
                  options={options}
                  onGradeChange={setGrade}
                />
              ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            <Panel className="space-y-2 p-3 sm:p-3">
              <SectionLabel className="pt-2">Settings</SectionLabel>
              <SettingsList options={options} onChange={setOptions} />
            </Panel>
            <TargetCard
              result={result}
              value={target}
              onValueChange={setTarget}
            />
          </div>

          <p className="px-2 pt-2 pb-6 text-xs text-muted-foreground">
            Grades listed are just unofficial estimates. Please double check
            with the registrar if possible!
          </p>
        </main>
      </div>
    </>
  );
}
