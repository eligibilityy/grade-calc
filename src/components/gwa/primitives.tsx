import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-[28px] bg-card p-5 sm:p-6", className)}
      {...props}
    />
  );
}

export function SectionLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("px-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Stat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 px-2 py-3 text-center">
      <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
      <div className="mt-1 truncate text-base font-medium tabular-nums sm:text-lg">
        {children}
      </div>
    </div>
  );
}

export function StatRow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 divide-x divide-dashed border-y border-dashed",
        className,
      )}
      {...props}
    />
  );
}

interface TileProps extends ComponentProps<"button"> {
  icon: ReactNode;
  tone?: "default" | "danger";
}

export function Tile({
  icon,
  tone = "default",
  className,
  children,
  ...props
}: TileProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5",
        tone === "danger"
          ? "bg-destructive/[0.07] text-destructive hover:bg-destructive/[0.12]"
          : "bg-muted hover:bg-accent",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
