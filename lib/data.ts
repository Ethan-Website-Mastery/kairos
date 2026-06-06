import type { Client } from "./types";
import { computeRisk, type RiskResult } from "./risk";

/**
 * Seeded, in-memory roster. No DB.
 * Maya is deliberately trending toward a miss: low recovery, behind on
 * sessions, gone quiet, and a packed calendar.
 */
export const clients: Client[] = [
  {
    id: "maya-okafor",
    name: "Maya Okafor",
    weeklyGoal: "4 sessions/week",
    signals: {
      sleepHrs: 5.4,
      hrv: 38,
      recoveryPct: 41,
      sessionsLogged: 1,
      weeklyGoal: 4,
      daysSinceCheckIn: 6,
      calendarLoad: "packed",
      nudgeResponseLatencyHrs: 28,
      plannedSessions: ["Tue", "Thu"],
      openWindows: ["Thu 7am"],
      history: {
        pastSlips: [
          "Dropped off for 10 days after a work trip in March",
          "Skipped her Thursday session 3 weeks running when a deadline hit",
        ],
        leversThatWorked: [
          "Shorter 20-min sessions during busy weeks",
          "Morning reminder before her first meeting",
        ],
        pastSlipDays: ["Thu"],
      },
    },
  },
  {
    id: "daniel-reyes",
    name: "Daniel Reyes",
    weeklyGoal: "3 sessions/week",
    // Archetype: motivational dip, stable logistics -> identity framing.
    signals: {
      sleepHrs: 7.0,
      hrv: 60,
      recoveryPct: 75,
      sessionsLogged: 1,
      weeklyGoal: 3,
      daysSinceCheckIn: 3,
      calendarLoad: "light",
      nudgeResponseLatencyHrs: 5,
      plannedSessions: ["Mon", "Wed", "Sat"],
      openWindows: ["Mon 6pm", "Wed 6pm", "Sat 9am"],
      history: {
        pastSlips: ["Motivation dipped once his goal race wrapped up"],
        leversThatWorked: [
          "Reconnecting with why he started running",
          "Signing up for the next race",
        ],
        pastSlipDays: ["Wed"],
      },
    },
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    weeklyGoal: "5 sessions/week",
    signals: {
      sleepHrs: 7.8,
      hrv: 71,
      recoveryPct: 84,
      sessionsLogged: 4,
      weeklyGoal: 5,
      daysSinceCheckIn: 1,
      calendarLoad: "light",
      nudgeResponseLatencyHrs: 2,
      plannedSessions: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      openWindows: ["Mon 6am", "Wed 6am", "Fri 6am"],
      history: {
        pastSlips: [],
        leversThatWorked: ["Streak tracking", "Early-morning slots"],
      },
    },
  },
  {
    id: "tom-becker",
    name: "Tom Becker",
    weeklyGoal: "4 sessions/week",
    signals: {
      sleepHrs: 7.1,
      hrv: 64,
      recoveryPct: 76,
      sessionsLogged: 3,
      weeklyGoal: 4,
      daysSinceCheckIn: 2,
      calendarLoad: "busy",
      nudgeResponseLatencyHrs: 4,
      plannedSessions: ["Tue", "Thu", "Sat", "Sun"],
      openWindows: ["Tue 6pm", "Sat 8am"],
      history: {
        pastSlips: ["Took two weeks off after a minor knee strain"],
        leversThatWorked: ["Swapping runs for cycling when sore", "Evening sessions"],
      },
    },
  },
  {
    id: "aisha-khan",
    name: "Aisha Khan",
    weeklyGoal: "4 sessions/week",
    // Archetype: broken streak / lost momentum -> loss aversion.
    signals: {
      sleepHrs: 7.2,
      hrv: 62,
      recoveryPct: 73,
      sessionsLogged: 2,
      weeklyGoal: 4,
      daysSinceCheckIn: 4,
      calendarLoad: "light",
      nudgeResponseLatencyHrs: 8,
      plannedSessions: ["Mon", "Wed", "Fri"],
      openWindows: ["Mon 6pm", "Wed 6pm", "Fri 6pm"],
      history: {
        pastSlips: ["Broke a 14-week streak last week, then went quiet"],
        leversThatWorked: [
          "Streak tracking — never breaking the chain",
          "Logging the session the night before",
        ],
        pastSlipDays: ["Wed"],
      },
    },
  },
  {
    id: "marcus-lee",
    name: "Marcus Lee",
    weeklyGoal: "4 sessions/week",
    signals: {
      sleepHrs: 7.4,
      hrv: 66,
      recoveryPct: 79,
      sessionsLogged: 3,
      weeklyGoal: 4,
      daysSinceCheckIn: 1,
      calendarLoad: "busy",
      nudgeResponseLatencyHrs: 3,
      plannedSessions: ["Mon", "Tue", "Thu", "Fri"],
      openWindows: ["Thu 7pm"],
      history: {
        pastSlips: [],
        leversThatWorked: ["Evening lifting blocks", "Monthly progress photos"],
      },
    },
  },
  {
    id: "sofia-romano",
    name: "Sofia Romano",
    weeklyGoal: "5 sessions/week",
    signals: {
      sleepHrs: 7.6,
      hrv: 69,
      recoveryPct: 81,
      sessionsLogged: 4,
      weeklyGoal: 5,
      daysSinceCheckIn: 1,
      calendarLoad: "light",
      nudgeResponseLatencyHrs: 2,
      plannedSessions: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      openWindows: ["Sat 8am"],
      history: {
        pastSlips: [],
        leversThatWorked: ["Streak tracking", "Saturday long ride with the club"],
      },
    },
  },
  {
    id: "jordan-hayes",
    name: "Jordan Hayes",
    weeklyGoal: "3 sessions/week",
    signals: {
      sleepHrs: 5.8,
      hrv: 58,
      recoveryPct: 74,
      sessionsLogged: 2,
      weeklyGoal: 3,
      daysSinceCheckIn: 2,
      calendarLoad: "busy",
      nudgeResponseLatencyHrs: 6,
      plannedSessions: ["Tue", "Thu", "Sun"],
      openWindows: ["Tue 12pm", "Thu 12pm"],
      history: {
        pastSlips: ["Took December off over the holidays"],
        leversThatWorked: ["Lunchtime runs between meetings"],
      },
    },
  },
];

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

/** Single source of truth for a client's risk — derived, never stored. */
export function riskOf(client: Client): RiskResult {
  return computeRisk(client.signals, client.signals.history);
}
