import Link from "next/link";
import { clients, riskOf } from "@/lib/data";
import type { RiskLevel } from "@/lib/types";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const firstName = (name: string) => name.split(" ")[0];

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

const rank: Record<RiskLevel, number> = { High: 2, Medium: 1, Low: 0 };

/**
 * Living roster — the command-center centerpiece. Each client is a large avatar
 * whose ring "breathes" by risk; the high-risk client emits an outward alert
 * ping; a scanner line sweeps the field to signal active monitoring. CSS-only,
 * reduced-motion aware.
 */
export default function RosterPulse() {
  const scored = clients
    .map((client) => ({ client, level: riskOf(client).level }))
    .sort((a, b) => rank[b.level] - rank[a.level]);

  const flagged = scored.filter((s) => s.level === "High").length;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 p-6 backdrop-blur elev-card">
      {/* scanning sweep — active monitoring */}
      <div
        aria-hidden
        className="scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          <p className="text-eyebrow text-neutral-400">Roster pulse</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            live
          </span>
          <span className="ml-auto text-xs text-neutral-400">
            {scored.length} monitored ·{" "}
            <span className="font-medium text-rose-600">{flagged} flagged</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {scored.map(({ client, level }) => (
            <Link
              key={client.id}
              href={`/client/${client.id}`}
              aria-label={`${client.name} — ${level} risk`}
              className="group flex flex-col items-center gap-2.5"
            >
              <span className="relative flex h-16 w-16 items-center justify-center">
                {level === "High" && (
                  <span
                    aria-hidden
                    className="ping-ring absolute inset-0 rounded-full border-2 border-rose-500"
                  />
                )}
                <span
                  className={`${PULSE[level]} ${RING[level]} flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white text-base font-semibold text-neutral-800 transition-transform group-hover:scale-105`}
                >
                  {initials(client.name)}
                </span>
              </span>
              <span className="text-xs text-neutral-500 transition-colors group-hover:text-neutral-900">
                {firstName(client.name)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
