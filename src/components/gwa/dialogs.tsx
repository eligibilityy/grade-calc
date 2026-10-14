"use client";

import { useState } from "react";
import { AwardIcon, Table2Icon, Trash2Icon } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GradeScaleTable } from "@/components/grade-scale-card";
import { DEANS_LIST, GRADUATION_HONORS, type HonorRule } from "@/lib/honors";
import { cn } from "@/lib/utils";
import { Tile } from "./primitives";
import type { SemesterSummary } from "./summary";

const DIALOG_CLASS = cn(
  "rounded-[28px] p-6 ring-0 sm:max-w-md",
  "[&>[data-slot=dialog-close]]:top-6 [&>[data-slot=dialog-close]]:right-6",
);

export function GradeScaleDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Tile icon={<Table2Icon />} />}>
        Grade scale
      </DialogTrigger>
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-lg">Grade scale</DialogTitle>
          <DialogDescription>
            How a course score out of 100 becomes a grade.
          </DialogDescription>
        </DialogHeader>
        <GradeScaleTable />
      </DialogContent>
    </Dialog>
  );
}

interface HonorsDialogProps {
  current: HonorRule | null;
  semesters: SemesterSummary[];
}

export function HonorsDialog({ current }: HonorsDialogProps) {
  // const earned = semesters.filter((s) => s.deansList !== null);

  return (
    <Dialog>
      <DialogTrigger render={<Tile icon={<AwardIcon />} />}>
        Honors
      </DialogTrigger>
      <DialogContent
        className={cn(
          DIALOG_CLASS,
          "flex max-h-[85dvh] flex-col overflow-hidden p-0",
        )}
      >
        <div className="my-3 mr-1.5 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-3 pr-4.5 pl-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Honors</DialogTitle>
            <DialogDescription>
              Estimated from grade points; the handbook uses percentages. NSTP
              isn&apos;t in the GWA but counts toward the lowest-grade rule.
            </DialogDescription>
          </DialogHeader>

          <RuleList
            title="Graduation"
            rules={GRADUATION_HONORS}
            current={current}
          />
          <RuleList
            title="Dean's List (per semester)"
            rules={DEANS_LIST}
            current={null}
          />

          {/* <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Dean&apos;s List so far
            </p>
            {earned.length === 0 ? (
              <p className="text-sm">None yet.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {earned.map((s) => (
                  <li key={s.key} className="flex justify-between gap-3">
                    <span>
                      {s.yearName}, {s.semester.name}
                    </span>
                    <span className="font-medium">
                      {s.deansList!.name.replace("Dean's List: ", "")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RuleList({
  title,
  rules,
  current,
}: {
  title: string;
  rules: HonorRule[];
  current: HonorRule | null;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{title}</p>
      <ul className="space-y-1.5">
        {rules.map((rule) => (
          <li
            key={rule.name}
            className={cn(
              "rounded-2xl px-3.5 py-2.5 transition-colors",
              rule === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            <div className="flex items-center justify-between gap-2 text-sm font-medium">
              {rule.name.replace("Dean's List: ", "")}
              {rule === current && (
                <span className="text-xs opacity-70">On track</span>
              )}
            </div>
            <p
              className={cn(
                "text-xs",
                rule === current
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {rule.handbook}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ClearGradesDialogProps {
  disabled: boolean;
  onClear: () => void;
}

export function ClearGradesDialog({
  disabled,
  onClear,
}: ClearGradesDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Tile icon={<Trash2Icon />} tone="danger" />}
        disabled={disabled}
      >
        Clear all
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-[28px] p-6 ring-0">
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all grades?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove all grades you&apos;ve entered. This action cannot
            be undone.
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
