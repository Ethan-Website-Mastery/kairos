import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, riskOf } from "@/lib/data";
import DriverList from "@/components/DriverList";
import IngestionPanel from "@/components/IngestionPanel";
import InterventionPanel from "@/components/InterventionPanel";
import LiveClientMonitor from "@/components/LiveClientMonitor";

const barColor = { Low: "bg-emerald-500", Medium: "bg-amber-500", High: "bg-rose-500" };

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] font-medium text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-100">{value}</p>
      {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
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
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href="/"
        className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
      >
        &larr; Roster
      </Link>

      {/* Dark command-center surface — the live client view */}
      <div className="mt-4 rounded-3xl bg-neutral-950 p-4 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:p-6">
        <LiveClientMonitor client={client} />

        {/* Two-column: left diagnosis (State → Why), right action (Decision →
            Delivery → Confidence → Loop). Stacks on narrow screens. */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* LEFT — diagnosis */}
          <div className="flex flex-col gap-6">
            <section
              className={`rounded-2xl border bg-white/5 px-5 py-4 ${
                level === "High"
                  ? "border-rose-500/40 ring-1 ring-rose-500/30"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-neutral-400">
                  Risk of missing the goal this window
                </p>
                <p className="text-xl font-semibold tabular-nums text-white">
                  {score}
                  <span className="text-sm font-normal text-neutral-500">/100</span>
                </p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${barColor[level]}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-eyebrow text-neutral-400">Current state</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Stat
                  label="Sessions"
                  value={`${s.sessionsLogged} / ${s.weeklyGoal}`}
                  hint="logged this week"
                />
                <Stat label="Recovery" value={`${s.recoveryPct}%`} hint="vs 70% baseline" />
                <Stat label="Sleep" value={`${s.sleepHrs}h`} hint="nightly average" />
                <Stat label="HRV" value={`${s.hrv}ms`} />
                <Stat label="Last check-in" value={`${s.daysSinceCheckIn}d ago`} />
                <Stat label="Calendar" value={s.calendarLoad} hint="this week" />
              </div>
              <div className="mt-3">
                <IngestionPanel client={client} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-eyebrow text-neutral-400">
                Why &mdash; top drivers
              </h2>
              <DriverList drivers={topDrivers} />
              <p className="mt-2 text-xs text-neutral-500">
                Transparent weighted sum: each driver adds its points.
              </p>
            </section>
          </div>

          {/* RIGHT — action */}
          <section className="flex flex-col">
            <h2 className="mb-3 text-eyebrow text-neutral-400">Intervention</h2>
            <InterventionPanel client={client} />
          </section>
        </div>
      </div>
    </div>
  );
}
