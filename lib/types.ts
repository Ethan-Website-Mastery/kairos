export type RiskLevel = "Low" | "Medium" | "High";

export type CalendarLoad = "light" | "busy" | "packed";

/** Behavioral + biometric signals we collect for each client. */
export interface Signals {
  sleepHrs: number;
  hrv: number;
  recoveryPct: number;
  sessionsLogged: number;
  weeklyGoal: number;
  daysSinceCheckIn: number;
  calendarLoad: CalendarLoad;
  nudgeResponseLatencyHrs: number;
  history: {
    pastSlips: string[];
    leversThatWorked: string[];
  };
}

export interface Client {
  id: string;
  name: string;
  /** Human-readable goal, e.g. "4 sessions/week". */
  weeklyGoal: string;
  signals: Signals;
}

/** Model output: where this client is heading and why. */
export interface Prediction {
  clientId: string;
  risk: RiskLevel;
  riskScore: number;
  likelyOutcome: string;
  drivers: string[];
  confidence: number;
}

/**
 * A generated intervention: the single chosen behavioral lever plus the
 * crafted nudge. `leverName` is filled server-side from the canonical
 * library — never from the model's output.
 */
export interface Intervention {
  clientId: string;
  leverId: string;
  leverName: string;
  reasoning: string;
  message: string;
  channel: string;
  timing: string;
  tone: string;
}

/** One step in the predict → intervene → observe loop, for auditing. */
export interface LoopEvent {
  id: string;
  clientId: string;
  at: string;
  kind: "prediction" | "intervention" | "observation";
  summary: string;
  payload?: Prediction | Intervention | Record<string, unknown>;
}
