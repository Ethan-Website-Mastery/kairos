import type { RiskLevel, Signals } from "./types";

export interface Driver {
  /** Short headline, e.g. "Recovery down 41%". */
  label: string;
  /** Points this driver contributes to the score (0–100 scale). */
  weight: number;
  /** Plain-language explanation, e.g. "energy crash likely". */
  detail: string;
}

export interface RiskResult {
  /** 0–100 chance of missing the weekly goal in the next window. */
  score: number;
  level: RiskLevel;
  /** Firing drivers, sorted by weight (highest first). */
  drivers: Driver[];
}

/** Healthy reference points the model scores deviations against. */
const BASELINE_RECOVERY = 70;

const HIGH_AT = 65;
const MEDIUM_AT = 30;

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));

function levelFor(score: number): RiskLevel {
  if (score >= HIGH_AT) return "High";
  if (score >= MEDIUM_AT) return "Medium";
  return "Low";
}

/**
 * Transparent, rule-based risk model. Each rule that fires adds a weighted
 * driver; the score is the clamped sum of those weights. No ML — every point
 * on the dial traces back to a named, explainable cause.
 */
export function computeRisk(
  signals: Signals,
  history: Signals["history"],
): RiskResult {
  const drivers: Driver[] = [];
  const {
    sleepHrs,
    recoveryPct,
    sessionsLogged,
    weeklyGoal,
    daysSinceCheckIn,
    calendarLoad,
    nudgeResponseLatencyHrs,
  } = signals;

  // Recovery sliding well below baseline → energy crash risk.
  const recoveryDrop = Math.round((1 - recoveryPct / BASELINE_RECOVERY) * 100);
  if (recoveryDrop > 15) {
    drivers.push({
      label: `Recovery down ${recoveryDrop}%`,
      weight: clamp(recoveryDrop, 0, 35),
      detail: "energy crash likely before the next session",
    });
  }

  // Behind pace on this week's sessions.
  const shortfall = weeklyGoal > 0 ? 1 - sessionsLogged / weeklyGoal : 0;
  if (shortfall >= 0.4) {
    drivers.push({
      label: "Behind pace",
      weight: Math.round(shortfall * 34),
      detail: `${sessionsLogged} of ${weeklyGoal} sessions`,
    });
  }

  // Gone quiet — engagement is the leading indicator of a drop-off.
  if (daysSinceCheckIn >= 3) {
    drivers.push({
      label: "Gone quiet",
      weight: (daysSinceCheckIn - 2) * 6,
      detail: `${daysSinceCheckIn} days since last check-in`,
    });
  }

  // No room in the week to actually train.
  if (calendarLoad === "packed") {
    drivers.push({
      label: "Packed calendar",
      weight: 12,
      detail: "no clear gym window on training days",
    });
  } else if (calendarLoad === "busy") {
    drivers.push({
      label: "Busy calendar",
      weight: 6,
      detail: "limited training windows this week",
    });
  }

  // Under-slept, which compounds everything else.
  if (sleepHrs < 6) {
    drivers.push({
      label: "Short sleep",
      weight: Math.round((6 - sleepHrs) * 8),
      detail: `averaging ${sleepHrs}h a night`,
    });
  }

  // Slow to respond to nudges — harder to course-correct.
  if (nudgeResponseLatencyHrs >= 24) {
    drivers.push({
      label: "Slow to respond",
      weight: 8,
      detail: `${nudgeResponseLatencyHrs}h since the last nudge`,
    });
  }

  // History context: only relevant once something else is already off, and
  // only for clients who have actually slipped before.
  const hasStrongDriver = drivers.some((d) => d.weight >= 10);
  if (history.pastSlips.length > 0 && hasStrongDriver) {
    drivers.push({
      label: "History of slips",
      weight: 6,
      detail: `has dropped off ${history.pastSlips.length === 1 ? "once" : `${history.pastSlips.length} times`} before`,
    });
  }

  const score = clamp(drivers.reduce((sum, d) => sum + d.weight, 0));
  drivers.sort((a, b) => b.weight - a.weight);

  return { score, level: levelFor(score), drivers };
}
