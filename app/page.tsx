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

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Kairos
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Coach dashboard
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
          <span>{clients.length} clients</span>
          <span className="text-neutral-300">·</span>
          <span>
            <span className="font-medium text-rose-600">{high}</span> need
            attention now
          </span>
          <span className="text-neutral-300">·</span>
          <span>
            <span className="font-medium text-amber-600">{medium}</span> to watch
          </span>
        </p>
      </header>

      {attention.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Needs attention
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attention.map(({ client }) => (
              <RosterCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}

      {onTrack.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
            On track
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {onTrack.map(({ client }) => (
              <RosterCard key={client.id} client={client} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
