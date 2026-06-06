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
    reasoning:
      "A gentle context cue is the safest nudge while the live recommendation is unavailable. Tie the session to something already in their day rather than adding pressure.",
    message:
      "Quick one — when you wrap up today, that's your cue for a short session. Even 20 minutes counts. 💪",
    channel: "push notification",
    timing: "Today, late afternoon",
    tone: "warm, low-pressure",
    rejected: {
      leverName: "Loss aversion / streak",
      why: "No streak to protect yet — threatening a loss would only add pressure.",
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
    reasoning:
      "Maya's barrier is logistical, not motivational — packed calendar, no clear gym window. Shorter 20-min sessions have worked for her in busy weeks, so Kairos removes the friction instead of pushing harder.",
    message:
      "Hey Maya — brutal week, I see it. Let's not aim for the full hour: 20 minutes before your first meeting tomorrow and we call it a win. I'll have it ready.",
    channel: "WhatsApp",
    timing: "Tomorrow 7:00am, before her first meeting",
    tone: "warm, low-pressure",
    rejected: {
      leverName: "Identity-based framing",
      why: "A pep talk misreads the problem — she isn't short on willpower, her week is logistically packed.",
    },
    predictedMoment:
      "Tomorrow 7am — her only open window before a packed day. Miss it and the week's unrecoverable.",
  },
};
