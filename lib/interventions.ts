import type { Intervention } from "./types";

export interface Lever {
  id: string;
  name: string;
  summary: string;
  whenItWorks: string;
}

/** The behavioral lever library Claude chooses exactly one from. */
export const LEVERS: Lever[] = [
  {
    id: "cue_trigger",
    name: "Cue / context trigger",
    summary: "attach behavior to an existing context cue",
    whenItWorks: "when they forget, not when unmotivated",
  },
  {
    id: "habit_stacking",
    name: "Habit stacking",
    summary: '"after X, I do Y" anchored to a routine',
    whenItWorks: "when they have stable daily anchors",
  },
  {
    id: "rewards",
    name: "Variable / fixed reward",
    summary: "add a dopamine hit to completion",
    whenItWorks: "when the behavior feels like a chore",
  },
  {
    id: "loss_aversion",
    name: "Loss aversion / streak",
    summary: "frame the skip as losing a streak/stake",
    whenItWorks: "when they have a streak to protect",
  },
  {
    id: "commitment_device",
    name: "Commitment device",
    summary: "pre-commit now while strong (Ulysses contract)",
    whenItWorks: "when willpower is variable but they're willing now",
  },
  {
    id: "social_accountability",
    name: "Social accountability",
    summary: "a real person sees if they skip",
    whenItWorks: "when they care about being seen / have a coach",
  },
  {
    id: "identity_framing",
    name: "Identity-based framing",
    summary: '"you\'re someone who trains"',
    whenItWorks: "when motivation dipped but self-image is strong",
  },
  {
    id: "friction",
    name: "Friction engineering",
    summary: "remove friction from the good thing",
    whenItWorks: "when the barrier is logistical, not motivational",
  },
  {
    id: "timing",
    name: "Timing (JITAI core)",
    summary: "right nudge at the right moment",
    whenItWorks: "when the same nudge lands or dies on when it arrives",
  },
];

export function getLever(id: string): Lever | undefined {
  return LEVERS.find((l) => l.id === id);
}

/** Generic, safe intervention used when the live call can't be trusted. */
export function genericFallback(clientId: string): Intervention {
  const lever = getLever("cue_trigger")!;
  return {
    clientId,
    leverId: lever.id,
    leverName: lever.name,
    reasoningBullets: [
      "Live recommendation unavailable — defaulting safe",
      "A gentle context cue fits any day",
      "→ Tie the session to a daily anchor, not pressure",
    ],
    message:
      "Quick one — when you wrap up today, that's your cue for a short session. Even 20 minutes counts. 💪",
    channel: "push notification",
    timing: "Today, late afternoon",
    tone: "warm, low-pressure",
    rejected: {
      leverName: "Loss aversion / streak",
      why: "No streak to protect yet — a loss threat just adds pressure.",
    },
    predictedMoment: "Later today — the window closes if no session gets booked.",
  };
}

/**
 * Per-client fallbacks, used if the live call fails. Starts with one hand-
 * written entry for the hero client; everyone else falls through to
 * genericFallback() in the route.
 */
export const FALLBACKS: Record<string, Intervention> = {
  "maya-okafor": {
    clientId: "maya-okafor",
    leverId: "friction",
    leverName: "Friction engineering",
    reasoningBullets: [
      "Logistical, not motivational — packed calendar, no gym window",
      "Short 20-min sessions kept her on track in busy weeks",
      "→ Remove the friction, don't add pressure",
    ],
    message:
      "Hey Maya — brutal week, I see it. Let's not aim for the full hour: 20 minutes before your first meeting tomorrow and we call it a win. I'll have it ready.",
    channel: "WhatsApp",
    timing: "Wed 8:00pm, the night before",
    tone: "warm, low-pressure",
    rejected: {
      leverName: "Identity-based framing",
      why: "A pep talk misreads it — she's short on time, not willpower.",
    },
    predictedMoment:
      "Thursday 7am — her only open window before a packed day, and the day she's slipped before.",
  },
  // Broken streak / lost momentum -> loss aversion.
  "aisha-khan": {
    clientId: "aisha-khan",
    leverId: "loss_aversion",
    leverName: "Loss aversion / streak",
    reasoningBullets: [
      "Lost momentum, not logistics — calendar clear, well recovered",
      "A 14-week streak broke last week; streaks keep her honest",
      "→ Reframe as protecting the comeback, not starting over",
    ],
    message:
      "Aisha — that 14-week streak only has one crack in it, not a collapse. Tonight's session is how you keep it alive — don't let one miss become two.",
    channel: "in-app",
    timing: "Wed 12:00pm, midday before",
    tone: "encouraging, momentum-focused",
    rejected: {
      leverName: "Friction engineering",
      why: "No friction to remove — her calendar's clear and she's recovered.",
    },
    predictedMoment:
      "Wednesday 6pm — the session that broke her streak last week.",
  },
  // Motivational dip, stable logistics -> identity framing.
  "daniel-reyes": {
    clientId: "daniel-reyes",
    leverId: "identity_framing",
    leverName: "Identity-based framing",
    reasoningBullets: [
      "Motivation dip, not a barrier — light calendar, recovery 75%",
      "Still sees himself as a runner, post-goal-race lull",
      "→ Reconnect him to that identity, don't nag the count",
    ],
    message:
      "Daniel — you're a runner between races, not someone who stops. A short Wednesday evening loop tonight is just you being you.",
    channel: "push notification",
    timing: "Wed 1:00pm, ahead of the evening",
    tone: "affirming, identity-first",
    rejected: {
      leverName: "Loss aversion / streak",
      why: "A streak threat rings hollow — he's reconnecting with being a runner.",
    },
    predictedMoment:
      "Wednesday 6pm — his planned run, the one he's let slide before.",
  },
};
