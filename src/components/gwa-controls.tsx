"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { BriefcaseIcon, HeartIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { GwaOptions } from "@/lib/grading";
import { cn } from "@/lib/utils";

interface GwaControlsProps {
  options: GwaOptions;
  onOptionsChange: (options: GwaOptions) => void;
  hasGrades: boolean;
  onClear: () => void;
}

/** Three square tiles under the status card: two GWA toggles and Clear all. */
export function GwaControls({
  options,
  onOptionsChange,
  hasGrades,
  onClear,
}: GwaControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <ToggleTile
        icon={<HeartIcon />}
        label="PATHFit"
        on={options.includePathfit}
        onChange={(on) => onOptionsChange({ ...options, includePathfit: on })}
      />
      <ToggleTile
        icon={<BriefcaseIcon />}
        label="Practicum"
        on={options.includePracticum}
        onChange={(on) => onOptionsChange({ ...options, includePracticum: on })}
      />
      <ClearGrades disabled={!hasGrades} onClear={onClear} />
    </div>
  );
}

const TILE =
  "flex aspect-square flex-col items-center justify-center gap-2 rounded-[28px] p-3 text-center outline-none select-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-6";

function TileLabel({ title, detail }: { title: string; detail: string }) {
  return (
    <span className="leading-tight">
      <span className="block text-sm font-medium">{title}</span>
      <span className="text-xs opacity-70">{detail}</span>
    </span>
  );
}

/** Solid when the courses count toward the GWA, greyed out when they don't. */
function ToggleTile({
  icon,
  label,
  on,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Count ${label} in GWA`}
      onClick={() => onChange(!on)}
      className={cn(
        TILE,
        on
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground/60 hover:text-muted-foreground",
      )}
    >
      {icon}
      <TileLabel title={label} detail={on ? "Counted" : "Not counted"} />
    </button>
  );
}

function ClearTile(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        TILE,
        "bg-destructive/[0.08] text-destructive hover:bg-destructive/[0.14]",
        props.className,
      )}
    />
  );
}

function ClearGrades({
  disabled,
  onClear,
}: {
  disabled: boolean;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<ClearTile />} disabled={disabled}>
        <TrashIcon />
        <TileLabel title="Clear all" detail="Grades" />
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[28px] p-6 ring-0">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all grades?</AlertDialogTitle>
          <AlertDialogDescription>
            Every grade you&apos;ve entered for this curriculum will be removed.
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="-mx-6 -mb-6 rounded-b-[28px] border-t-0 bg-muted p-4">
          <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-full"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Clear all
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
