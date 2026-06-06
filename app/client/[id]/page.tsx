import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, riskOf } from "@/lib/data";
import RiskBadge from "@/components/RiskBadge";
import DriverList from "@/components/DriverList";

const barColor = { Low: "bg-emerald-500", Medium: "bg-amber-500", High: "bg-rose-500" };

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-neutral-900">{value}</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
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

      {/* Risk score */}
      <section className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-neutral-500">
            Risk of missing the goal this window
          </p>
          <p className="text-3xl font-semibold tabular-nums text-neutral-900">
            {score}
            <span className="text-base font-normal text-neutral-400">/100</span>
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className={`h-full rounded-full ${barColor[level]}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </section>

      {/* Current state */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">Current state</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">
          Why &mdash; top drivers
        </h2>
        <DriverList drivers={topDrivers} />
        <p className="mt-3 text-xs text-neutral-400">
          Score is a transparent weighted sum: each driver above adds its points.
        </p>
      </section>
    </main>
  );
}
