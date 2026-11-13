"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { BriefcaseIcon, HeartIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AdaptiveDialog } from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";
import type { GwaOptions } from "@/lib/grading";
import { cn } from "@/lib/utils";

interface GwaControlsProps {
  options: GwaOptions;
  onOptionsChange: (options: GwaOptions) => void;
  hasGrades: boolean;
  onClear: () => void;
}

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
  "flex aspect-square flex-col items-center justify-center gap-2 rounded-[28px] p-3 text-center outline-none select-none transition-[transform,scale,background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-6";

function TileLabel({ title, detail }: { title: string; detail: string }) {
  return (
    <span className="leading-tight">
      <span className="block text-sm font-medium">{title}</span>
      <span className="text-xs opacity-75">{detail}</span>
    </span>
  );
}

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
          ? "bg-[var(--primary-bg)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)]"
          : "bg-surface-top text-ink-11 hover:bg-ink-2 [&_svg]:text-ink-8",
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
        "bg-red-100 text-[var(--red-11)] hover:bg-red-200",
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
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <AdaptiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={<ClearTile />}
      triggerChildren={
        <>
          <TrashIcon />
          <TileLabel title="Clear" detail="All grades" />
        </>
      }
      disabled={disabled}
      variant="confirm"
      destructive
      title="Clear all grades?"
      description="Every grade you've entered for this curriculum will be removed. This can't be undone."
      initialFocus={confirmRef}
      footer={(close) => (
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            ref={confirmRef}
            variant="destructive"
            onClick={() => {
              onClear();
              close();
            }}
          >
            Clear all grades
          </Button>
        </>
      )}
    />
  );
}
