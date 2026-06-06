"use client";

import { useEffect, useRef, useState } from "react";
import { clients, riskOf } from "@/lib/data";
import { FALLBACKS } from "@/lib/interventions";

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

const first = (name: string) => name.split(" ")[0];

type Tone = "high" | "med" | "low" | "info";
type Ev = { text: string; tone: Tone };

/** Real engine actions, derived from live roster state — presented as a feed. */
function buildEvents(): Ev[] {
  const scored = clients
    .map((c) => ({ c, r: riskOf(c) }))
    .sort((a, b) => b.r.score - a.r.score);
  const high = scored.filter((s) => s.r.level === "High");
  const med = scored.filter((s) => s.r.level === "Medium");
  const low = scored.filter((s) => s.r.level === "Low");
  const lever = (id: string) => SHORT_LEVER[FALLBACKS[id]?.leverId] ?? "intervention";

  const ev: Ev[] = [];
  ev.push({ text: `Scanned roster · ${clients.length} clients`, tone: "info" });
  for (const { c } of high)
    ev.push({ text: `${first(c.name)} → HIGH · ${lever(c.id)} nudge drafted`, tone: "high" });
  ev.push({ text: `${high.length} flagged for intervention`, tone: high.length ? "high" : "info" });
  for (const { c } of med)
    ev.push({ text: `${first(c.name)} → MEDIUM · ${lever(c.id)} on standby`, tone: "med" });
  ev.push({ text: `${med.length} to watch · monitoring`, tone: med.length ? "med" : "info" });
  for (const { c } of low.slice(0, 3))
    ev.push({ text: `${first(c.name)} · on track`, tone: "low" });
  ev.push({ text: `Re-scored ${clients.length} clients`, tone: "info" });
  return ev;
}

const DOT: Record<Tone, string> = {
  high: "bg-rose-500",
  med: "bg-amber-500",
  low: "bg-emerald-500",
  info: "bg-neutral-400",
};

export default function LiveActivityFeed() {
  const [rows, setRows] = useState<{ id: number; time: string; ev: Ev }[]>([]);
  const events = useRef<Ev[]>(buildEvents());
  const cursor = useRef(0);
  const nextId = useRef(0);

  useEffect(() => {
    // Timestamps + rows are populated only after mount (no SSR mismatch).
    const stamp = () =>
      new Date().toLocaleTimeString([], { hour12: false });
    const push = () => {
      const list = events.current;
      const ev = list[cursor.current % list.length];
      cursor.current += 1;
      setRows((r) => [{ id: nextId.current++, time: stamp(), ev }, ...r].slice(0, 7));
    };
    for (let k = 0; k < 4; k++) push(); // seed
    const t = setInterval(push, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="elev-card flex h-full flex-col rounded-2xl border border-neutral-200/70 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-eyebrow text-neutral-400">Activity</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          live
        </span>
      </div>
      <ul className="flex min-h-[168px] flex-col gap-2.5">
        {rows.map((r) => (
          <li
            key={r.id}
            className="animate-rise flex items-center gap-2.5 text-xs"
          >
            <span className="shrink-0 font-mono tabular-nums text-neutral-400">
              {r.time}
            </span>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[r.ev.tone]}`} />
            <span className="truncate text-neutral-700">{r.ev.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
