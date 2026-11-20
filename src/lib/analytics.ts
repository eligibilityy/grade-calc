/**
 * Custom events for Umami. They record that something happened, never a
 * grade or a GWA.
 *
 * Each event fires at most once per page load, so the counts and funnels mean
 * "visits where this happened" rather than "keystrokes".
 */
export type AnalyticsEvent =
  | "course_entered" // typed into any course box
  | "gwa_calculated" // an edit produced a valid grade, so a GWA shows
  | "semester_completed"; // an edit filled the last course of a semester

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

const sent = new Set<AnalyticsEvent>();

export function trackOnce(event: AnalyticsEvent, data?: EventData) {
  if (sent.has(event)) return;
  sent.add(event);
  try {
    window.umami?.track(event, data);
  } catch {}
}
