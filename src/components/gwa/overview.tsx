"use client";

import type { ReactNode } from "react";
import { Calligraph } from "calligraph";
import { gradeInfo, type GradePoint, type GwaResult } from "@/lib/grading";
import type { HonorRule } from "@/lib/honors";
import { cn } from "@/lib/utils";
import { ClearGradesDialog, GradeScaleDialog, HonorsDialog } from "./dialogs";
import { Panel, Stat, StatRow } from "./primitives";
import { formatGwa, type SemesterSummary } from "./summary";

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

interface HeadlineProps {
  result: GwaResult;
  honor: HonorRule | null;
}

export function Headline({ result, honor }: HeadlineProps) {
  const { unitsTaken, unitsLeft } = result;

  return (
    <h1 className="text-[1.65rem] leading-snug font-medium tracking-tight text-balance sm:text-4xl sm:leading-tight">
      {unitsTaken === 0 ? (
        <>
          <Muted>Pick</Muted> grades <Muted>for your courses.</Muted>{" "}
          <Muted>
            <br />
            Your
          </Muted>{" "}
          GWA <Muted>and</Muted> honors <Muted>update as you go.</Muted>
        </>
      ) : (
        <>
          <Calligraph variant="number">{unitsTaken}</Calligraph> units{" "}
          <Muted>graded</Muted>
          {unitsLeft > 0 ? (
            <>
              <Muted>,</Muted>{" "}
              <Calligraph variant="number">{unitsLeft}</Calligraph>{" "}
              <Muted>to go.</Muted>
            </>
          ) : (
            <Muted>, all done.</Muted>
          )}{" "}
          <br />
          {honor ? (
            <>
              <Muted>{unitsLeft > 0 ? "On track for" : "You earned"}</Muted>{" "}
              {honor.name}
              <Muted>.</Muted>
            </>
          ) : (
            <Muted>Not on track for Latin honors yet.</Muted>
          )}
        </>
      )}
    </h1>
  );
}

interface OverviewPanelProps {
  result: GwaResult;
  lowest: GradePoint | null;
  honor: HonorRule | null;
  semesters: SemesterSummary[];
  selectedYear: number;
  onSelectYear: (yearIndex: number) => void;
  hasGrades: boolean;
  onClear: () => void;
}

export function OverviewPanel({
  result,
  lowest,
  honor,
  semesters,
  selectedYear,
  onSelectYear,
  hasGrades,
  onClear,
}: OverviewPanelProps) {
  return (
    <Panel className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-muted-foreground">Cumulative GWA</p>
          <p className="mt-1 flex items-baseline gap-1">
            <Calligraph
              variant="number"
              className="text-6xl font-medium tracking-tight tabular-nums"
            >
              {formatGwa(result.gwa)}
            </Calligraph>
            <span className="text-2xl text-muted-foreground">/4.00</span>
          </p>
        </div>

        <StatRow>
          <Stat label="Graded">{result.unitsTaken}u</Stat>
          <Stat label="Left">{result.unitsLeft}u</Stat>
          <Stat label="Lowest">
            {lowest === null
              ? "—"
              : `${lowest.toFixed(2)} ${gradeInfo(lowest).letter}`}
          </Stat>
        </StatRow>

        <div className="mt-auto grid grid-cols-3 gap-2">
          <GradeScaleDialog />
          <HonorsDialog current={honor} semesters={semesters} />
          <ClearGradesDialog disabled={!hasGrades} onClear={onClear} />
        </div>
      </div>

      <SemesterChart
        semesters={semesters}
        selectedYear={selectedYear}
        onSelectYear={onSelectYear}
      />
    </Panel>
  );
}

interface SemesterChartProps {
  semesters: SemesterSummary[];
  selectedYear: number;
  onSelectYear: (yearIndex: number) => void;
}

function SemesterChart({
  semesters,
  selectedYear,
  onSelectYear,
}: SemesterChartProps) {
  return (
    <div className="flex h-56 gap-1.5 sm:gap-2 md:h-auto md:min-h-64">
      {semesters.map((s) => {
        const height = s.gwa === null ? 0 : Math.max((s.gwa / 4) * 100, 24);
        const active = s.yearIndex === selectedYear;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelectYear(s.yearIndex)}
            aria-label={`${s.yearName}, ${s.semester.name}: GWA ${formatGwa(s.gwa)}`}
            aria-pressed={active}
            className="group flex min-w-0 flex-1 flex-col gap-2 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="relative block w-full flex-1 overflow-hidden rounded-xl bg-hatch">
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 overflow-hidden rounded-xl",
                  "transition-[height,background-color,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-accent",
                )}
                style={{ height: `${height}%` }}
              >
                <span className="flex flex-col items-center gap-1.5 pt-2">
                  <span className="h-1 w-5 shrink-0 rounded-full bg-current opacity-25" />
                  <span className="text-[11px] font-medium tabular-nums sm:text-xs">
                    {formatGwa(s.gwa)}
                  </span>
                </span>
              </span>
            </span>
            <span
              className={cn(
                "text-center text-[11px] tabular-nums transition-colors sm:text-xs",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              Y{s.yearIndex + 1}·{s.semesterIndex + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
