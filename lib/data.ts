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
      history: {
        pastSlips: [
          "Dropped off for 10 days after a work trip in March",
          "Skipped 3 weeks when a project deadline hit",
        ],
        leversThatWorked: [
          "Shorter 20-min sessions during busy weeks",
          "Morning reminder before her first meeting",
        ],
      },
    },
  },
  {
    id: "daniel-reyes",
    name: "Daniel Reyes",
    weeklyGoal: "3 sessions/week",
    signals: {
      sleepHrs: 6.6,
      hrv: 52,
      recoveryPct: 63,
      sessionsLogged: 1,
      weeklyGoal: 3,
      daysSinceCheckIn: 3,
      calendarLoad: "busy",
      nudgeResponseLatencyHrs: 9,
      history: {
        pastSlips: ["Lost momentum over the December holidays"],
        leversThatWorked: ["Pairing workouts with a friend", "Weekend long runs"],
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
    signals: {
      sleepHrs: 6.8,
      hrv: 55,
      recoveryPct: 58,
      sessionsLogged: 2,
      weeklyGoal: 4,
      daysSinceCheckIn: 2,
      calendarLoad: "busy",
      nudgeResponseLatencyHrs: 5,
      history: {
        pastSlips: ["Stopped for a month after moving apartments"],
        leversThatWorked: ["Booking classes a week ahead", "A Monday gym buddy"],
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
