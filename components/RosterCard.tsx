import Link from "next/link";
import type { Client } from "@/lib/types";
import type { Driver } from "@/lib/risk";
import { riskOf } from "@/lib/data";
import RiskBadge from "./RiskBadge";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Compact, scannable form of a risk driver for the roster card. */
function abbreviate(d: Driver): string {
  const L = d.label;
  if (L.startsWith("Recovery")) return L.replace("Recovery down", "recovery");
  if (L === "Gone quiet") {
    const days = d.detail.match(/^(\d+)/)?.[1] ?? "";
    return `${days}d quiet`;
  }
  if (L === "Behind pace") return "behind pace";
  if (L === "Packed calendar") return "calendar packed";
  if (L === "Busy calendar") return "calendar busy";
  if (L === "Short sleep") {
    const h = d.detail.match(/([\d.]+)h/)?.[1];
    return h ? `sleep ${h}h` : "low sleep";
  }
  if (L === "Slow to respond") return "slow to reply";
  if (L === "History of slips") return "slip history";
  return L.toLowerCase();
}

export default function RosterCard({
  client,
  className = "",
}: {
  client: Client;
  className?: string;
}) {
  const { sessionsLogged, weeklyGoal } = client.signals;
  const { level, drivers } = riskOf(client);
  const atRisk = level !== "Low";

  const why = atRisk
    ? drivers.slice(0, 3).map(abbreviate).join(" · ")
    : null;

  const accent =
    level === "High"
      ? "border-rose-200 ring-4 ring-rose-50 hover:border-rose-300"
      : "border-neutral-200/80 hover:border-neutral-300";

  return (
    <Link
      href={`/client/${client.id}`}
      className={`elev-card hover:elev-card-hover group flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-all ${accent} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
            {initials(client.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-neutral-900">
              {client.name}
            </h2>
            <p className="truncate text-xs text-neutral-500">
              {why ?? client.weeklyGoal}
            </p>
          </div>
        </div>
        <RiskBadge level={level} />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="text-sm text-neutral-500">
          <span className="font-medium text-neutral-900">{sessionsLogged}</span>
          <span className="text-neutral-400"> / {weeklyGoal}</span> sessions this week
        </div>
        <span className="text-sm text-neutral-400 transition-colors group-hover:text-neutral-900">
          View &rarr;
        </span>
      </div>
    </Link>
  );
}
