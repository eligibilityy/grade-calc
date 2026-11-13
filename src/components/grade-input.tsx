"use client";

import { useId } from "react";
import { parseGradeInput } from "@/lib/grade-input";
import { cn } from "@/lib/utils";

interface GradeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** One box for a Canvas score, grade point or letter, with what it became. */
export function GradeInput({ label, value, onChange }: GradeInputProps) {
  const resultId = useId();
  const parsed = parseGradeInput(value);
  const invalid = parsed !== null && !parsed.ok;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={resultId}
        placeholder="—"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-[4.75rem] rounded-full border px-3 text-center text-base tabular-nums outline-none transition-colors duration-200 sm:text-sm",
          "placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          value === ""
            ? "border-dashed bg-transparent"
            : "border-transparent bg-muted font-medium",
          invalid &&
            "border-destructive bg-destructive/[0.06] focus-visible:ring-destructive/20",
        )}
      />
      <span
        id={resultId}
        aria-live="polite"
        className="w-[4.5rem] text-sm leading-tight tabular-nums"
      >
        {parsed === null ? (
          <span className="text-muted-foreground/60">No grade</span>
        ) : parsed.ok ? (
          <span className={parsed.grade.point === 0 ? "text-destructive" : ""}>
            <span className="font-medium">{parsed.grade.point.toFixed(2)}</span>{" "}
            <span className="text-muted-foreground">{parsed.grade.letter}</span>
          </span>
        ) : (
          <span className="text-destructive">{parsed.error}</span>
        )}
      </span>
    </div>
  );
}
