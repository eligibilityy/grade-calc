"use client";

import { useRef, useState } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradeScaleCard } from "@/components/grade-scale-card";
import {
  PASSING_SCORE,
  WEIGHTS,
  courseScoreParts,
  finalExamTargets,
  roundScore,
  scoreToGrade,
  type Score,
} from "@/lib/grading";

interface ScoreInput {
  earned: string;
  max: string;
}

interface GtRow extends ScoreInput {
  id: number;
}

const EMPTY: ScoreInput = { earned: "", max: "" };

function parseScore(input: ScoreInput): Score | "empty" | "invalid" {
  if (input.earned.trim() === "" && input.max.trim() === "") return "empty";
  const earned = Number(input.earned);
  const max = Number(input.max);
  if (input.earned.trim() === "" || input.max.trim() === "") return "invalid";
  if (
    !Number.isFinite(earned) ||
    !Number.isFinite(max) ||
    max <= 0 ||
    earned < 0 ||
    earned > max
  )
    return "invalid";
  return { earned, max };
}

const asScore = (parsed: Score | "empty" | "invalid") =>
  typeof parsed === "object" ? parsed : null;

export function CourseCalculator() {
  const [gts, setGts] = useState<GtRow[]>([
    { id: 1, ...EMPTY },
    { id: 2, ...EMPTY },
    { id: 3, ...EMPTY },
  ]);
  const [midterm, setMidterm] = useState<ScoreInput>(EMPTY);
  const [final, setFinal] = useState<ScoreInput>(EMPTY);
  const nextId = useRef(4);

  const gtScores = gts
    .map(parseScore)
    .map(asScore)
    .filter((s): s is Score => s !== null);
  const parts = courseScoreParts(
    gtScores,
    asScore(parseScore(midterm)),
    asScore(parseScore(final)),
  );

  function updateGt(id: number, field: keyof ScoreInput, value: string) {
    setGts((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function addGt() {
    const id = nextId.current++;
    setGts((rows) => [...rows, { id, ...EMPTY }]);
  }

  function removeGt(id: number) {
    setGts((rows) => rows.filter((row) => row.id !== id));
  }

  function reset() {
    setGts([1, 2, 3].map((id) => ({ id, ...EMPTY })));
    nextId.current = 4;
    setMidterm(EMPTY);
    setFinal(EMPTY);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Graded Tasks ({WEIGHTS.gts}%)</CardTitle>
            <CardDescription>
              Add as many as your subject has. Points are added together, then
              scaled to {WEIGHTS.gts}%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gts.map((row, index) => (
              <div key={row.id} className="flex items-end gap-2">
                <ScoreFields
                  id={`gt-${row.id}`}
                  label={`GT ${index + 1}`}
                  value={row}
                  onChange={(field, value) => updateGt(row.id, field, value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGt(row.id)}
                  disabled={gts.length === 1}
                  aria-label={`Remove GT ${index + 1}`}
                >
                  <MinusCircleIcon />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addGt}>
              <PlusCircleIcon />
              Add graded task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Major Assessments</CardTitle>
            <CardDescription>
              Midterm and Final are worth {WEIGHTS.midterm}% each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScoreFields
              id="midterm"
              label={`Midterm (${WEIGHTS.midterm}%)`}
              value={midterm}
              onChange={(field, value) =>
                setMidterm((s) => ({ ...s, [field]: value }))
              }
            />
            <ScoreFields
              id="final"
              label={`Final (${WEIGHTS.final}%)`}
              value={final}
              onChange={(field, value) =>
                setFinal((s) => ({ ...s, [field]: value }))
              }
            />
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6">
        <ResultCard
          gts={parts.gts}
          midterm={parts.midterm}
          final={parts.final}
          onReset={reset}
        />
        <GradeScaleCard />
      </aside>
    </div>
  );
}

interface ScoreFieldsProps {
  id: string;
  label: string;
  value: ScoreInput;
  onChange: (field: keyof ScoreInput, value: string) => void;
}

function ScoreFields({ id, label, value, onChange }: ScoreFieldsProps) {
  const invalid = parseScore(value) === "invalid";
  return (
    <fieldset className="flex flex-1 items-end gap-2">
      <legend className="sr-only">{label}</legend>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor={`${id}-earned`}>{label}</Label>
        <Input
          id={`${id}-earned`}
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="Score"
          value={value.earned}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange("earned", e.target.value)}
        />
      </div>
      <span className="pb-2 text-muted-foreground">/</span>
      <div className="flex-1 space-y-1.5">
        <Label htmlFor={`${id}-max`} className="sr-only">
          {label} total
        </Label>
        <Input
          id={`${id}-max`}
          type="number"
          inputMode="decimal"
          min={1}
          placeholder="Total"
          value={value.max}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange("max", e.target.value)}
        />
      </div>
    </fieldset>
  );
}

interface ResultCardProps {
  gts: number | null;
  midterm: number | null;
  final: number | null;
  onReset: () => void;
}

function ResultCard({ gts, midterm, final, onReset }: ResultCardProps) {
  const rows = [
    { label: `Graded Tasks (${WEIGHTS.gts})`, value: gts },
    { label: `Midterm (${WEIGHTS.midterm})`, value: midterm },
    { label: `Final (${WEIGHTS.final})`, value: final },
  ];
  const complete = gts !== null && midterm !== null && final !== null;
  const total = (gts ?? 0) + (midterm ?? 0) + (final ?? 0);
  const grade = scoreToGrade(total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course grade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <table className="w-full text-sm tabular-nums">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-1 text-muted-foreground">{row.label}</td>
                <td className="py-1 text-right">
                  {row.value === null ? "—" : row.value.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-t font-medium">
              <td className="py-1">Total (100)</td>
              <td className="py-1 text-right">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {complete ? (
          <div className="space-y-1 text-center">
            <p className="text-5xl font-semibold tabular-nums">
              {grade.point.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {grade.letter} · score rounds to {roundScore(total)}
            </p>
            {roundScore(total) < PASSING_SCORE && (
              <Badge variant="destructive">
                Below passing ({PASSING_SCORE})
              </Badge>
            )}
          </div>
        ) : gts !== null && midterm !== null ? (
          <FinalTargets pointsSoFar={gts + midterm} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter your graded tasks and midterm to see what you need on the
            final.
          </p>
        )}

        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}

function FinalTargets({ pointsSoFar }: { pointsSoFar: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">What you need on the final</p>
      <table className="w-full text-sm tabular-nums">
        <tbody>
          {finalExamTargets(pointsSoFar).map(
            ({ grade, neededPercent, status }) => (
              <tr key={grade.letter} className="border-t">
                <td className="py-1.5">
                  {grade.point.toFixed(2)} ({grade.letter})
                </td>
                <td className="py-1.5 text-right">
                  {status === "secured" && (
                    <span className="text-muted-foreground">Secured</span>
                  )}
                  {status === "possible" && `${neededPercent.toFixed(1)}%`}
                  {status === "out-of-reach" && (
                    <span className="text-muted-foreground">Out of reach</span>
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
