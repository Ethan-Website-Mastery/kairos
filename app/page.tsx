import { clients, riskOf } from "@/lib/data";
import RosterCard from "@/components/RosterCard";

export default function Dashboard() {
  // Sort by risk desc, then split so the people who need attention surface up top.
  const scored = clients
    .map((client) => ({ client, risk: riskOf(client) }))
    .sort((a, b) => b.risk.score - a.risk.score);

  const attention = scored.filter((s) => s.risk.level !== "Low");
  const onTrack = scored.filter((s) => s.risk.level === "Low");
  const high = scored.filter((s) => s.risk.level === "High").length;
  const medium = scored.filter((s) => s.risk.level === "Medium").length;
  const low = onTrack.length;
  const total = clients.length;

  const pct = (n: number) => `${(n / total) * 100}%`;
  const needWord = high === 1 ? "needs" : "need";

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Kairos
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Coach dashboard
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
          <span>{total} clients</span>
          <span className="text-neutral-300">·</span>
          <span>
            <span className="font-medium text-rose-600">{high}</span> {needWord}{" "}
            attention now
          </span>
          <span className="text-neutral-300">·</span>
          <span>
            <span className="font-medium text-amber-600">{medium}</span> to watch
          </span>
        </p>

        {/* Roster-health strip — live split, derived from riskOf */}
        <div className="mt-5 max-w-md">
          <div className="flex h-2 overflow-hidden rounded-full bg-neutral-100">
            {high > 0 && <div className="bg-rose-500" style={{ width: pct(high) }} />}
            {medium > 0 && (
              <div className="bg-amber-400" style={{ width: pct(medium) }} />
            )}
            {low > 0 && (
              <div className="bg-emerald-500" style={{ width: pct(low) }} />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
            <Legend dot="bg-rose-500" label="High" n={high} />
            <Legend dot="bg-amber-400" label="Medium" n={medium} />
            <Legend dot="bg-emerald-500" label="On track" n={low} />
          </div>
        </div>
      </header>

      {attention.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Needs attention
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attention.map(({ client }, i) => (
              <RosterCard
                key={client.id}
                client={client}
                // Last card of an odd set spans full width — no empty gap.
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
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            On track
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onTrack.map(({ client }) => (
              <RosterCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
      <span className="font-medium text-neutral-700">{n}</span>
    </span>
  );
}
