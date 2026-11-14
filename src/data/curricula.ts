import type { Curriculum } from "@/lib/types";
import { bmma2026 } from "./dlsl-bmma-2026";
import { bscs2026 } from "./dlsl-bscs-2026";

/**
 * Every curriculum the app offers. To add a program, create its data file
 * next to this one and add it here; the picker appears once there are two.
 */
export const CURRICULA: Curriculum[] = [bscs2026, bmma2026];

export function getCurriculum(id: string): Curriculum | undefined {
  return CURRICULA.find((c) => c.id === id);
}
