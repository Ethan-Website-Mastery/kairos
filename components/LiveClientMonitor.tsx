"use client";

import { useEffect, useRef, useState } from "react";
import type { Client, RiskLevel } from "@/lib/types";
import { computeRisk } from "@/lib/risk";
import { FALLBACKS } from "@/lib/interventions";
import { leverTrackRecord } from "@/lib/loop";

const SHORT_LEVER: Record<string, string> = {
  friction: "friction",
  loss_aversion: "loss-aversion",
  identity_framing: "identity",
  cue_trigger: "cue",
  habit_stacking: "habit-stack",
  rewards: "reward",
  commitment_device: "commitment",
  social_accountability: "accountability",
  timing: "timing",
};

const RING: Record<RiskLevel, string> = {
  Low: "border-emerald-400",
  Medium: "border-amber-400",
  High: "border-rose-500",
};
const PULSE: Record<RiskLevel, string> = {
  Low: "pulse-calm",
  Medium: "pulse-watch",
  High: "pulse-alert",
};
const LEVEL_TEXT: Record<RiskLevel, string> = {
  Low: "text-emerald-400",
  Medium: "text-amber-400",
  High: "text-rose-400",
};

type Tone = "high" | "med" | "low" | "info";
const DOT: Record<Tone, string> = {
  high: "bg-rose-500",
  med: "bg-amber-500",
  low: "bg-emerald-500",
  info: "bg-neutral-500",
};

/** Dark per-client monitor mirroring the home command center: pulsing risk
 *  avatar + live status + a mini activity feed, all derived from real state. */
export default function LiveClientMonitor({ client }: { client: Client }) {
  const risk = computeRisk(client.signals, client.signals.history);
  const level = risk.level;
  const fb = FALLBACKS[client.id];
  const lever = fb ? SHORT_LEVER[fb.leverId] ?? "intervention" : "intervention";
  const win = client.signals.openWindows[0];
  const tr = fb ? leverTrackRecord(fb.leverId, client.signals.history) : 0;

  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tone: Tone = level === "High" ? "high" : level === "Medium" ? "med" : "low";
  const events = useRef<{ text: string; tone: Tone }[]>(
    [
      { text: `Flagged · ${level.toUpperCase()} risk`, tone },
      { text: `${lever} nudge drafted`, tone: "info" as Tone },
      { text: "Awaiting coach approval", tone: "info" as Tone },
      ...(tr > 0
        ? [{ text: `Pattern: ${lever} worked ${tr}× before`, tone: "low" as Tone }]
        : []),
      ...(win ? [{ text: `Predicted slip · ${win}`, tone }] : []),
      { text: "Monitoring signals · live", tone: "info" as Tone },
    ],
  );

  const [rows, setRows] = useState<
    { id: number; time: string; ev: { text: string; tone: Tone } }[]
  >([]);
  const cursor = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    const stamp = () => new Date().toLocaleTimeString([], { hour12: false });
    const push = () => {
      const list = events.current;
      const ev = list[cursor.current % list.length];
      cursor.current += 1;
      setRows((r) => [{ id: nextId.current++, time: stamp(), ev }, ...r].slice(0, 5));
    };
    for (let k = 0; k < 3; k++) push();
    const t = setInterval(push, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div
        aria-hidden
        className="scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent"
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            {level === "High" && (
              <span
                aria-hidden
                className="ping-ring absolute inset-0 rounded-full border-2 border-rose-500"
              />
            )}
            <span
              className={`${PULSE[level]} ${RING[level]} flex h-20 w-20 items-center justify-center rounded-full border-2 bg-neutral-900 text-xl font-semibold text-white`}
            >
              {initials}
            </span>
          </span>
          <div>
            <p className="text-eyebrow text-neutral-500">Live client monitor</p>
            <p className="mt-1 text-lg font-semibold text-white">{client.name}</p>
            <p className={`text-sm font-medium ${LEVEL_TEXT[level]}`}>
              {level} risk · {risk.score}/100
              <span className="font-normal text-neutral-500"> · {client.weeklyGoal}</span>
            </p>
          </div>
        </div>

        <div className="sm:w-64">
          <div className="mb-2 flex items-center gap-1 text-[10px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </div>
          <ul className="flex min-h-[92px] flex-col gap-1.5">
            {rows.map((r) => (
              <li
                key={r.id}
                className="animate-rise flex items-center gap-2 text-[11px]"
              >
                <span className="shrink-0 font-mono tabular-nums text-neutral-500">
                  {r.time}
                </span>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[r.ev.tone]}`} />
                <span className="truncate text-neutral-300">{r.ev.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
