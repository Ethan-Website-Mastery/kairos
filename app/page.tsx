import { clients, riskOf } from "@/lib/data";
import RosterCard from "@/components/RosterCard";
import RosterPulse from "@/components/RosterPulse";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import CatchMoment from "@/components/CatchMoment";
import { PlusIcon } from "@/components/icons";

function Readout({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-medium text-neutral-300">{n}</span>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const scored = clients
    .map((client) => ({ client, risk: riskOf(client) }))
    .sort((a, b) => b.risk.score - a.risk.score);

  const attention = scored.filter((s) => s.risk.level !== "Low");
  const onTrack = scored.filter((s) => s.risk.level === "Low");
  const high = scored.filter((s) => s.risk.level === "High").length;
  const medium = scored.filter((s) => s.risk.level === "Medium").length;
  const low = onTrack.length;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Page header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-neutral-400">Kairos</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Coach dashboard
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-500">
            Catching the moment a client is about to slip — and intervening
            before they do.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add client
        </button>
      </header>

      {/* Command center — owns the overview (no duplicate stat cards below) */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-neutral-950 p-3 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 px-3 pt-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-eyebrow text-neutral-500">
            Kairos command center
          </span>
          <span className="flex items-center gap-3 text-[11px] text-neutral-400">
            <Readout dot="bg-rose-500" label="high" n={high} />
            <Readout dot="bg-amber-400" label="watch" n={medium} />
            <Readout dot="bg-emerald-500" label="on track" n={low} />
          </span>
          <CatchMoment />
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RosterPulse ops />
          </div>
          <LiveActivityFeed ops />
        </div>
      </div>

      {/* Roster — drill-down */}
      {attention.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-eyebrow text-neutral-400">Needs attention</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attention.map(({ client }, i) => (
              <RosterCard
                key={client.id}
                client={client}
                className={
                  attention.length % 2 === 1 && i === attention.length - 1
                    ? "sm:col-span-2"
                    : ""
                }
              />
            ))}
          </div>
        </section>
      )}

      {onTrack.length > 0 && (
        <section>
          <h2 className="mb-3 text-eyebrow text-neutral-400">On track</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onTrack.map(({ client }) => (
              <RosterCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
