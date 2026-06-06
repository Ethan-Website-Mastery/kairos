import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, riskOf } from "@/lib/data";
import DriverList from "@/components/DriverList";
import IngestionPanel from "@/components/IngestionPanel";
import InterventionPanel from "@/components/InterventionPanel";
import LiveClientMonitor from "@/components/LiveClientMonitor";

function Chip({ dot, children }: { dot: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-200">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

const sev = (good: boolean, warn: boolean) =>
  good ? "bg-emerald-500" : warn ? "bg-amber-400" : "bg-rose-500";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const { drivers } = riskOf(client);
  const s = client.signals;
  const topDrivers = drivers.slice(0, 3);
  const ratio = s.sessionsLogged / s.weeklyGoal;

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

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          {/* LEFT — diagnosis (glanceable chips; depth in expanders) */}
          <div className="flex flex-col gap-5">
            <section>
              <h2 className="mb-3 text-eyebrow text-neutral-400">Signals</h2>
              <div className="flex flex-wrap gap-2">
                <Chip dot={sev(s.recoveryPct >= 70, s.recoveryPct >= 60)}>
                  Recovery {s.recoveryPct}%{s.recoveryPct < 70 ? " ↓" : ""}
                </Chip>
                <Chip dot={sev(ratio >= 0.8, ratio >= 0.5)}>
                  {s.sessionsLogged}/{s.weeklyGoal} sessions
                </Chip>
                <Chip
                  dot={sev(
                    s.daysSinceCheckIn < 3,
                    s.daysSinceCheckIn < 5,
                  )}
                >
                  {s.daysSinceCheckIn >= 3 ? "Quiet" : "Check-in"}{" "}
                  {s.daysSinceCheckIn}d
                </Chip>
                <Chip
                  dot={sev(
                    s.calendarLoad === "light",
                    s.calendarLoad === "busy",
                  )}
                >
                  Calendar {s.calendarLoad}
                </Chip>
              </div>

              {/* depth: the weighted breakdown, one click away */}
              <details className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-300 [&::-webkit-details-marker]:hidden">
                  <span className="transition-transform group-open:rotate-180">⌄</span>
                  Weighted breakdown
                </summary>
                <div className="mt-3">
                  <DriverList drivers={topDrivers} />
                  <p className="mt-2 text-xs text-neutral-500">
                    Transparent weighted sum: each driver adds its points.
                  </p>
                </div>
              </details>
            </section>

            <IngestionPanel client={client} />
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
