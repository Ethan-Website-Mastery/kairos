import type { Client, Intervention, Signals } from "./types";
import type { RiskResult } from "./risk";

/** Modest, realistic uptick from being rested and re-engaged — not a cure. */
const RECOVERY_UPTICK = 13;
const RE_ENGAGED_LATENCY = 2;
const RECOVERY_CEILING = 90;

/**
 * Signals after the client re-engages and follows through once. Kept so the
 * timeline can show the honest follow-through action (a session logged), even
 * though confidence — not a recomputed risk — is now the headline.
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

/* ── Track record: how many times this lever has worked for this person ──
   An HONEST count from seeded history — no invented denominator or ratio.
   Each confirmed success is logged and weighted higher next time. */

/** Keywords that tie a free-text past success to a lever id. */
const LEVER_KEYWORDS: Record<string, string[]> = {
  friction: ["shorter", "20-min", "20 min", "smaller", "fewer", "bite-size", "minutes"],
  loss_aversion: ["streak", "chain", "break", "stake", "loss"],
  identity_framing: ["identity", "why he started", "why she started", "who you are", "runner", "athlete", "race"],
  cue_trigger: ["reminder", "cue", "trigger", "prompt"],
  habit_stacking: ["habit stack", "stack", "routine", "pair", "anchor"],
  rewards: ["reward", "treat", "points", "prize"],
  commitment_device: ["commit", "book ahead", "booking", "ahead of time", "pre-commit", "sign up", "signing up"],
  social_accountability: ["buddy", "friend", "coach", "partner", "group", "club", "accountab"],
  timing: ["morning", "evening", "early", "slot", "lunchtime", "midday"],
};

/**
 * How many recorded past successes this person has with the chosen lever —
 * the lever's track record for them. Counts matches in leversThatWorked; 0
 * means no prior record (a new play), never a fabricated number.
 */
export function leverTrackRecord(
  leverId: string,
  history: Signals["history"],
): number {
  const kws = LEVER_KEYWORDS[leverId] ?? [];
  return history.leversThatWorked.filter((s) => {
    const t = s.toLowerCase();
    return kws.some((k) => t.includes(k));
  }).length;
}

export interface LoopStep {
  label: string;
  detail: string;
  /** The track-record beat — emphasized in the timeline. */
  highlight?: boolean;
}

/**
 * The five beats of the closed loop, built from REAL values: the original
 * prediction, the chosen intervention, and this lever's track record.
 */
export function buildLoopEvents(
  client: Client,
  before: RiskResult,
  intervention: Intervention,
  trackRecord: number,
): LoopStep[] {
  const firstName = client.name.split(" ")[0];
  const topDriver = before.drivers[0];
  const lever = intervention.leverName;

  return [
    {
      label: "Predicted",
      detail: `Risk ${before.score}/100 (${before.level})${
        topDriver ? ` — ${topDriver.label}: ${topDriver.detail}` : ""
      }`,
    },
    {
      label: "Intervened",
      detail: `${lever} · ${intervention.channel} · ${intervention.timing}`,
    },
    {
      label: "Followed through",
      detail: `${firstName} logged their session`,
    },
    {
      label: "Track record updated",
      detail: `${lever} → logged again for ${firstName}, weighted higher`,
      highlight: true,
    },
    {
      label: "Logged for learning",
      detail:
        trackRecord > 0
          ? `${lever} has now worked ${trackRecord + 1}× for ${firstName} — weighted higher next time`
          : `${lever} logged as a first win for ${firstName} — weighted higher next time`,
    },
  ];
}
