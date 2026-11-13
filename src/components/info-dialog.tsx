"use client";

import type { ReactNode } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { AdaptiveDialog } from "@/components/ui/adaptive-dialog";
import { Button } from "@/components/ui/button";
import { DEANS_LIST, GRADUATION_HONORS, type HonorRule } from "@/lib/honors";
import { cn } from "@/lib/utils";
import { GradeScaleTable } from "./grade-scale-table";

export function InfoDialog({ honor }: { honor: HonorRule | null }) {
  return (
    <AdaptiveDialog
      trigger={
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Grade scale and honors"
          className="rounded-full bg-surface-top text-ink-11 hover:bg-ink-2"
        />
      }
      triggerChildren={<InformationCircleIcon className="size-5" />}
      title="Grade Scale and Honors"
      description="Grades stay on this device. Results are unofficial estimates."
    >
      <div className="space-y-7">
        <Section title="Grade scale">
          <GradeScaleTable />
        </Section>

        <Section title="Latin honors">
          <RuleList rules={GRADUATION_HONORS} current={honor} />
        </Section>

        <Section title="Dean's List (each semester)">
          <RuleList rules={DEANS_LIST} current={null} />
          <p className="text-xs text-ink-11">
            NSTP isn&apos;t in the GPA but counts toward the lowest-grade rule.
            Graduation honors also require no suspension or Category 2 offense.
          </p>
        </Section>
      </div>
    </AdaptiveDialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm text-ink-11">{title}</h3>
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
    <ul className="overflow-hidden rounded-2xl bg-ink-2">
      {rules.map((rule) => {
        const active = rule === current;
        return (
          <li
            key={rule.name}
            className={cn(
              "border-b-[0.5px] border-ink-4 px-3.5 py-2.5 last:border-b-0",
              active && "bg-ink-4",
            )}
          >
            <div className="flex items-center justify-between gap-2 text-sm font-medium text-ink-12">
              {rule.name.replace("Dean's List: ", "")}
              {active && (
                <span className="h-5 rounded-full bg-surface-top px-2 text-xs leading-5 text-ink-11">
                  On track
                </span>
              )}
            </div>
            <p className="text-xs text-ink-11">{rule.handbook}</p>
          </li>
        );
      })}
    </ul>
  );
}
