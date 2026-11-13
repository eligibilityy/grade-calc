"use client";

import type { ReactNode } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEANS_LIST, GRADUATION_HONORS, type HonorRule } from "@/lib/honors";
import { cn } from "@/lib/utils";
import { GradeScaleTable } from "./grade-scale-table";

/** Reference info: the grade scale and the honors rules. */
export function InfoDialog({ honor }: { honor: HonorRule | null }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Grade scale and honors"
            className="rounded-full text-muted-foreground"
          />
        }
      >
        <InformationCircleIcon className="size-5" />
      </DialogTrigger>
      <DialogContent className="flex max-h-[85dvh] flex-col overflow-hidden rounded-[28px] p-0 ring-0 sm:max-w-md [&>[data-slot=dialog-close]]:top-5 [&>[data-slot=dialog-close]]:right-5">
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Grade Scale and Honors</DialogTitle>
            <DialogDescription>
              Grades stay on this device. Results are unofficial estimates.
            </DialogDescription>
          </DialogHeader>

          <Section title="Grade scale">
            <GradeScaleTable />
          </Section>

          <Section title="Latin honors">
            <RuleList rules={GRADUATION_HONORS} current={honor} />
          </Section>

          <Section title="Dean's List (each semester)">
            <RuleList rules={DEANS_LIST} current={null} />
            <p className="text-xs text-muted-foreground">
              NSTP isn&apos;t in the GPA but counts toward the lowest-grade rule.
              Graduation honors also require no suspension or Category 2 offense.
            </p>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function RuleList({
  rules,
  current,
}: {
  rules: HonorRule[];
  current: HonorRule | null;
}) {
  return (
    <ul className="space-y-1.5">
      {rules.map((rule) => {
        const active = rule === current;
        return (
          <li
            key={rule.name}
            className={cn(
              "rounded-2xl px-3.5 py-2.5",
              active ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <div className="flex items-center justify-between gap-2 text-sm font-medium">
              {rule.name.replace("Dean's List: ", "")}
              {active && <span className="text-xs opacity-70">On track</span>}
            </div>
            <p
              className={cn(
                "text-xs",
                active ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {rule.handbook}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
