"use client";

import { Calligraph } from "calligraph";
import { targetGwa, type GradePoint, type GwaResult } from "@/lib/grading";
import {
  GRADUATION_HONORS,
  blockedHonors,
  nextHonor,
  type HonorRule,
} from "@/lib/honors";
import { formatGwa, type SemesterSummary } from "@/lib/summary";

interface StatusCardProps {
  program: string;
  result: GwaResult;
  honor: HonorRule | null;
  lowest: GradePoint | null;
  semesters: SemesterSummary[];
}

export function StatusCard({
  program,
  result,
  honor,
  lowest,
  semesters,
}: StatusCardProps) {
  const { gwa, unitsTaken, unitsLeft } = result;
  const totalUnits = unitsTaken + unitsLeft;
  const progress = totalUnits === 0 ? 0 : (unitsTaken / totalUnits) * 100;
  const finished = semesters.filter((s) => s.complete);
  const deansList = finished.filter((s) => s.deansList !== null);

  return (
    <section className="rounded-[28px] bg-card p-5 sm:p-7">
      <p className="text-sm text-muted-foreground">{program}</p>

      <div className="mt-3 flex flex-col items-start justify-between gap-x-6 gap-y-3">
        <p className="flex items-baseline gap-1">
          <Calligraph
            variant="number"
            className="text-6xl font-medium tracking-tight tabular-nums"
          >
            {formatGwa(gwa)}
          </Calligraph>
          <span className="text-2xl text-muted-foreground">/4.00</span>
        </p>
        <p className="pb-1.5 text-lg text-muted-foreground font-medium sm:text-xl">
          {unitsTaken === 0
            ? "Enter a grade to get started."
            : honor
              ? `${unitsLeft > 0 ? "On track for" : "You earned"} ${honor.name}`
              : unitsLeft > 0
                ? "Not on track for Latin honors yet"
                : "No Latin honors"}
        </p>
      </div>

      {unitsTaken > 0 && (
        <NextStep result={result} honor={honor} lowest={lowest} />
      )}

      <div className="mt-5 space-y-2">
        <div
          role="progressbar"
          aria-label="Units graded"
          aria-valuemin={0}
          aria-valuemax={totalUnits}
          aria-valuenow={unitsTaken}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground tabular-nums">
          <span>
            {unitsTaken} of {totalUnits} units graded
          </span>
          {finished.length > 0 && (
            <span>
              Dean&apos;s List {deansList.length} of {finished.length}{" "}
              {finished.length === 1 ? "semester" : "semesters"}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}

/** What it takes to reach the next honors tier, worked out automatically. */
function NextStep({
  result,
  honor,
  lowest,
}: {
  result: GwaResult;
  honor: HonorRule | null;
  lowest: GradePoint | null;
}) {
  const blocked = blockedHonors(GRADUATION_HONORS, lowest);
  const goal = nextHonor(GRADUATION_HONORS, honor, lowest);
  const target = goal ? targetGwa(result, goal.minGwa) : null;

  const lines: string[] = [];
  if (goal && target?.kind === "needed") {
    lines.push(
      `Average ${target.value.toFixed(2)} on the ${result.unitsLeft} units left, with no grade below ${goal.minGrade.toFixed(2)}, for ${goal.name}.`,
    );
  } else if (goal && target?.kind === "out-of-reach") {
    lines.push(
      `${goal.name} is out of reach: it would take a ${target.value.toFixed(2)} average.`,
    );
  }
  if (blocked.length > 0 && lowest !== null) {
    lines.push(
      `A ${lowest.toFixed(2)} rules out ${blocked.map((r) => r.name).join(" and ")}.`,
    );
  }
  if (lines.length === 0) return null;

  return (
    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
