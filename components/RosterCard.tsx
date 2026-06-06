import Link from "next/link";
import type { Client } from "@/lib/types";
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

export default function RosterCard({ client }: { client: Client }) {
  const { sessionsLogged, weeklyGoal } = client.signals;
  const { level } = riskOf(client);

  return (
    <Link
      href={`/client/${client.id}`}
      className="group flex flex-col gap-5 rounded-2xl border border-neutral-200/80 bg-white p-6 transition-all hover:border-neutral-300 hover:shadow-[0_2px_20px_-8px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
            {initials(client.name)}
          </span>
          <div>
            <h2 className="font-semibold text-neutral-900">{client.name}</h2>
            <p className="text-sm text-neutral-500">{client.weeklyGoal}</p>
          </div>
        </div>
        <RiskBadge level={level} />
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
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
