import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, riskOf } from "@/lib/data";
import RiskBadge from "@/components/RiskBadge";
import DriverList from "@/components/DriverList";
import InterventionPanel from "@/components/InterventionPanel";

const barColor = { Low: "bg-emerald-500", Medium: "bg-amber-500", High: "bg-rose-500" };

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white px-3 py-2">
      <p className="text-[11px] font-medium text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900">{value}</p>
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const { score, level, drivers } = riskOf(client);
  const s = client.signals;
  const topDrivers = drivers.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
      >
        &larr; Roster
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{client.weeklyGoal}</p>
        </div>
        <RiskBadge level={level} />
      </div>

      {/* Risk score — compact diagnosis */}
      <section
        className={`mt-6 rounded-xl border bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
          level === "High" ? "border-rose-200 ring-4 ring-rose-50" : "border-neutral-200/80"
        }`}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-neutral-500">
            Risk of missing the goal this window
          </p>
          <p className="text-xl font-semibold tabular-nums text-neutral-900">
            {score}
            <span className="text-sm font-normal text-neutral-400">/100</span>
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full ${barColor[level]}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </section>

      {/* Current state */}
      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Current state
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat
            label="Sessions"
            value={`${s.sessionsLogged} / ${s.weeklyGoal}`}
            hint="logged this week"
          />
          <Stat label="Recovery" value={`${s.recoveryPct}%`} hint="vs 70% baseline" />
          <Stat label="Sleep" value={`${s.sleepHrs}h`} hint="nightly average" />
          <Stat label="HRV" value={`${s.hrv}ms`} />
          <Stat
            label="Last check-in"
            value={`${s.daysSinceCheckIn}d ago`}
          />
          <Stat label="Calendar" value={s.calendarLoad} hint="this week" />
        </div>
      </section>

      {/* Why */}
      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Why &mdash; top drivers
        </h2>
        <DriverList drivers={topDrivers} />
        <p className="mt-2 text-xs text-neutral-400">
          Transparent weighted sum: each driver adds its points.
        </p>
      </section>

      {/* Intervention + loop — the hero of the page */}
      <section className="mt-12 border-t border-neutral-200 pt-10">
        <h2 className="mb-4 text-sm font-semibold tracking-tight text-neutral-900">
          Intervention
        </h2>
        <InterventionPanel client={client} />
      </section>
    </main>
  );
}
