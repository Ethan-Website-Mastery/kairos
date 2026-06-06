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
 * Living roster — a command-center early-warning band. Each client is an avatar
 * whose ring "breathes" by risk: calm green when on track, faster amber to
 * watch, urgent glowing red when about to slip. CSS-only; reduced-motion aware.
 */
export default function RosterPulse() {
  const scored = clients
    .map((client) => ({ client, level: riskOf(client).level }))
    .sort((a, b) => rank[b.level] - rank[a.level]);

  return (
    <section className="elev-card rounded-2xl border border-neutral-200/70 bg-white/70 p-5 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <p className="text-eyebrow text-neutral-400">Roster pulse</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          live
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-4 sm:gap-x-8">
        {scored.map(({ client, level }) => (
          <Link
            key={client.id}
            href={`/client/${client.id}`}
            aria-label={`${client.name} — ${level} risk`}
            className="group flex flex-col items-center gap-2"
          >
            <span
              className={`${PULSE[level]} ${RING[level]} flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold text-neutral-700 transition-transform group-hover:scale-105`}
            >
              {initials(client.name)}
            </span>
            <span className="text-[11px] text-neutral-500 transition-colors group-hover:text-neutral-900">
              {firstName(client.name)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
