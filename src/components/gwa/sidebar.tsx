"use client";

import { useId } from "react";
import { Calligraph } from "calligraph";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { targetGwa, type GwaOptions, type GwaResult } from "@/lib/grading";
import { cn } from "@/lib/utils";
import { formatGwa } from "./summary";

export function Brand({ school }: { school: string }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="leading-tight">
        <p className="font-medium">GWA Calculator</p>
        <p className="text-sm text-muted-foreground">{school}</p>
      </div>
    </div>
  );
}

interface YearNavProps {
  years: { name: string; gwa: number | null }[];
  selected: number;
  onSelect: (index: number) => void;
}

export function YearNav({ years, selected, onSelect }: YearNavProps) {
  return (
    <ul className="space-y-1">
      {years.map((year, i) => {
        const active = i === selected;
        return (
          <li key={year.name}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-lg text-xs font-medium tabular-nums transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/[0.06]",
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1">{year.name}</span>
              <Calligraph
                variant="number"
                className="text-sm text-muted-foreground tabular-nums"
              >
                {formatGwa(year.gwa)}
              </Calligraph>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function YearPills({ years, selected, onSelect }: YearNavProps) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-full bg-card p-1">
      {years.map((year, i) => {
        const active = i === selected;
        return (
          <button
            key={year.name}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-full px-2 py-2 text-sm outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {year.name.replace(" Year", "")}
          </button>
        );
      })}
    </div>
  );
}

interface SettingsListProps {
  options: GwaOptions;
  onChange: (options: GwaOptions) => void;
}

export function SettingsList({ options, onChange }: SettingsListProps) {
  return (
    <div className="space-y-1">
      <SettingRow
        label="PATHFit"
        description="Count PE in your GWA"
        checked={options.includePathfit}
        onCheckedChange={(checked) =>
          onChange({ ...options, includePathfit: checked })
        }
      />
      <SettingRow
        label="Practicum"
        description="Count the 400-hour practicum"
        checked={options.includePracticum}
        onCheckedChange={(checked) =>
          onChange({ ...options, includePracticum: checked })
        }
      />
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-200 hover:bg-card/60"
    >
      <span className="leading-tight">
        <span className="block">{label}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

interface TargetCardProps {
  result: GwaResult;
  value: string;
  onValueChange: (value: string) => void;
}

export function TargetCard({ result, value, onValueChange }: TargetCardProps) {
  const id = useId();
  const target = Number.parseFloat(value);

  return (
    <div className="rounded-3xl bg-primary p-4 text-primary-foreground">
      <label htmlFor={id} className="block font-medium">
        Target GWA
      </label>
      <p className="text-sm text-primary-foreground/60">
        What you need on the units left.
      </p>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={2}
        max={4}
        step={0.01}
        placeholder="e.g. 3.50"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="mt-2 h-11 rounded-xl border-0 bg-white/[0.08] px-3.5 text-base text-primary-foreground tabular-nums placeholder:text-primary-foreground/35 focus-visible:ring-white/20 dark:bg-white/[0.08]"
      />
      <p className="mt-2 text-primary-foreground/60 text-sm">
        {Number.isFinite(target) ? (
          <TargetMessage {...targetGwa(result, target)} />
        ) : (
          <span className="text-primary-foreground/50">
            Enter a target above.
          </span>
        )}
      </p>
    </div>
  );
}

function TargetMessage(props: ReturnType<typeof targetGwa>) {
  switch (props.kind) {
    case "no-units-left":
      return (
        <span className="text-primary-foreground/70">
          Every GWA unit is already graded.
        </span>
      );
    case "already-met":
      return <span>You&apos;ve already secured this GWA.</span>;
    case "needed":
      return (
        <span className="text-primary-foreground/70">
          You need{" "}
          <Calligraph
            variant="number"
            className="font-medium text-primary-foreground tabular-nums"
          >
            {props.value.toFixed(2)}
          </Calligraph>{" "}
          on average.
        </span>
      );
    case "out-of-reach":
      return (
        <span className="text-red-300">
          You&apos;d need {props.value.toFixed(2)}, which is above 4.00.
        </span>
      );
  }
}
