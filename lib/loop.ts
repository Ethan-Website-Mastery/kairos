import type { Client, Intervention, Signals } from "./types";
import type { RiskResult } from "./risk";

/** Modest, realistic uptick from being rested and re-engaged — not a cure. */
const RECOVERY_UPTICK = 13;
const RE_ENGAGED_LATENCY = 2;
const RECOVERY_CEILING = 90;

/**
 * Signals after the client re-engages and follows through once. Designed so
 * that feeding the result back into the SAME computeRisk drops the score
 * across at least one level boundary, without faking a miracle recovery.
 */
export function improvedSignals(signals: Signals): Signals {
  return {
    ...signals,
    sessionsLogged: Math.min(signals.weeklyGoal, signals.sessionsLogged + 1),
    daysSinceCheckIn: 0,
    nudgeResponseLatencyHrs: RE_ENGAGED_LATENCY,
    recoveryPct: Math.min(RECOVERY_CEILING, signals.recoveryPct + RECOVERY_UPTICK),
  };
}

export interface LoopStep {
  label: string;
  detail: string;
  /** The risk-drop beat — emphasized in the timeline. */
  highlight?: boolean;
}

/**
 * The five beats of the closed loop, built from REAL values: the original
 * prediction, the chosen intervention, and the recomputed risk.
 */
export function buildLoopEvents(
  client: Client,
  before: RiskResult,
  intervention: Intervention,
  after: RiskResult,
): LoopStep[] {
  const firstName = client.name.split(" ")[0];
  const topDriver = before.drivers[0];

  return [
    {
      label: "Predicted",
      detail: `Risk ${before.score}/100 (${before.level})${
        topDriver ? ` — ${topDriver.label}: ${topDriver.detail}` : ""
      }`,
    },
    {
      label: "Intervened",
      detail: `${intervention.leverName} · ${intervention.channel} · ${intervention.timing}`,
    },
    {
      label: "Followed through",
      detail: `${firstName} logged their session`,
    },
    {
      label: "Risk updated",
      detail: `${before.score} → ${after.score} (${before.level} → ${after.level})`,
      highlight: true,
    },
    {
      label: "Logged for learning",
      detail: `${intervention.leverName} worked for ${firstName} — weighted up for next time`,
    },
  ];
}
