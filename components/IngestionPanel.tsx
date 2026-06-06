import type { Client } from "@/lib/types";

function LiveTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-neutral-400">{label}</p>
        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function RoadmapTile({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-100/60 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-neutral-400">{label}</p>
        <span className="shrink-0 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
          Roadmap
        </span>
      </div>
      <p className="mt-0.5 text-sm font-medium text-neutral-400">{detail}</p>
    </div>
  );
}

/**
 * The full ingestion picture — what Kairos uses to decide. CONNECTED values are
 * live, straight from this client's Signals. ROADMAP items are vision, NOT live,
 * and are deliberately styled so no one could mistake them for shipped.
 */
export default function IngestionPanel({ client }: { client: Client }) {
  const s = client.signals;
  const slipCount = s.history.pastSlips.length;
  const slipDays = s.history.pastSlipDays?.length
    ? ` · ${s.history.pastSlipDays.join("/")}`
    : "";

  const live: [string, string][] = [
    ["Training sessions", `${s.sessionsLogged} / ${s.weeklyGoal} this week`],
    ["Recovery", `${s.recoveryPct}%`],
    ["Sleep", `${s.sleepHrs}h / night`],
    ["HRV", `${s.hrv} ms`],
    ["Check-in recency", `${s.daysSinceCheckIn}d ago`],
    ["Calendar load", s.calendarLoad],
    ["Planned sessions", s.plannedSessions.join(", ") || "—"],
    ["Open windows", s.openWindows.join(", ") || "—"],
    ["Nudge-response latency", `${s.nudgeResponseLatencyHrs}h`],
    ["Slip history", `${slipCount} past slip${slipCount === 1 ? "" : "s"}${slipDays}`],
  ];

  const roadmap: [string, string][] = [
    ["Live wearable sync", "Whoop · Garmin · Oura"],
    ["Weather", "rain / heat at session time"],
    ["Location / GPS", "near the gym?"],
    ["App usage / screen time", "engagement signals"],
  ];

  return (
    <details className="group rounded-xl border border-neutral-200/80 bg-white elev-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            What Kairos ingests
          </p>
          <p className="text-xs text-neutral-400">
            {live.length} live · {roadmap.length} roadmap
          </p>
        </div>
        <span className="text-neutral-400 transition-transform group-open:rotate-180">
          ⌄
        </span>
      </summary>

      <div className="border-t border-neutral-100 px-5 py-5">
        <div className="flex items-center gap-2">
          <h3 className="text-eyebrow text-neutral-400">Connected</h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            live now
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {live.map(([label, value]) => (
            <LiveTile key={label} label={label} value={value} />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <h3 className="text-eyebrow text-neutral-400">Roadmap</h3>
          <span className="text-[10px] font-medium text-neutral-400">
            vision — not live yet
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {roadmap.map(([label, detail]) => (
            <RoadmapTile key={label} label={label} detail={detail} />
          ))}
        </div>
      </div>
    </details>
  );
}
