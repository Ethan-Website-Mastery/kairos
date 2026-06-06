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

/* ── Confidence: the system's belief in a lever for a person ──
   Grounded in how often that lever has worked for them before, NOT a
   prediction of their behaviour. More prior successes → higher confidence. */

const CONF_BASE = 60;
const CONF_PER_SUCCESS = 10;
const CONF_CAP = 90;
const CONF_AFTER_CAP = 95;
/** One confirmed follow-through nudges belief up by this much. */
export const CONF_LEARNING_STEP = 12;

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

/** How many of this person's past successes align with the chosen lever. */
export function leverPriorSuccesses(
  leverId: string,
  history: Signals["history"],
): number {
  const kws = LEVER_KEYWORDS[leverId] ?? [];
  return history.leversThatWorked.filter((s) => {
    const t = s.toLowerCase();
    return kws.some((k) => t.includes(k));
  }).length;
}

/** Current confidence (%) that this lever works for this person. */
export function leverConfidence(
  leverId: string,
  history: Signals["history"],
): number {
  const successes = leverPriorSuccesses(leverId, history);
  return Math.min(CONF_CAP, CONF_BASE + successes * CONF_PER_SUCCESS);
}

/** Confidence after one more confirmed follow-through. */
export function confidenceAfter(confidence: number): number {
  return Math.min(CONF_AFTER_CAP, confidence + CONF_LEARNING_STEP);
}

export interface LoopStep {
  label: string;
  detail: string;
  /** The confidence beat — emphasized in the timeline. */
  highlight?: boolean;
}

/**
 * The five beats of the closed loop, built from REAL values: the original
 * prediction, the chosen intervention, and the engine's confidence in it.
 */
export function buildLoopEvents(
  client: Client,
  before: RiskResult,
  intervention: Intervention,
  confidence: number,
  confidenceNext: number,
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
      label: "Confidence updated",
      detail: `${confidence}% → ${confidenceNext}% that ${intervention.leverName} works for ${firstName}`,
      highlight: true,
    },
    {
      label: "Logged for learning",
      detail: `${intervention.leverName} confirmed for ${firstName} — confidence up, weighted higher next time`,
    },
  ];
}
