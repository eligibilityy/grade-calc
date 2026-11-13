"use client";

import { useId } from "react";
import { parseGradeInput } from "@/lib/grade-input";
import { cn } from "@/lib/utils";

interface GradeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

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
        // 16px text on touch screens, or iOS zooms in on focus
        className={cn(
          "h-9 w-[4.75rem] rounded-full border-0 bg-ink-3 px-3 text-center text-sm text-ink-12 tabular-nums outline-none transition-[background-color,box-shadow] duration-150 ease-out max-md:h-11 pointer-coarse:text-base",
          "placeholder:text-ink-10 focus:bg-ink-4 focus-visible:shadow-[0_0_0_2px_var(--focus-ring)]",
          value !== "" && "font-medium",
          invalid &&
            "bg-[var(--red-3)] text-[var(--red-11)] focus:bg-[var(--red-4)]",
        )}
      />
      <span
        id={resultId}
        aria-live="polite"
        className="w-[4.5rem] text-sm leading-tight tabular-nums"
      >
        {parsed === null ? (
          <span className="text-ink-10">No grade</span>
        ) : parsed.ok ? (
          <span className={parsed.grade.point === 0 ? "text-[var(--red-11)]" : "text-ink-12"}>
            <span className="font-medium">{parsed.grade.point.toFixed(2)}</span>{" "}
            <span className="text-ink-11">{parsed.grade.letter}</span>
          </span>
        ) : (
          <span className="text-[var(--red-11)]">{parsed.error}</span>
        )}
      </span>
    </div>
  );
}
