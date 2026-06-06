import { clients, riskOf } from "@/lib/data";
import RosterCard from "@/components/RosterCard";

export default function Dashboard() {
  const atRisk = clients.filter((c) => riskOf(c).level !== "Low").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Kairos
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
          Coach dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-500">
          Catching the moment a client is about to slip &mdash; {clients.length}{" "}
          clients, <span className="font-medium text-neutral-700">{atRisk}</span>{" "}
          needing attention now.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clients.map((client) => (
          <RosterCard key={client.id} client={client} />
        ))}
      </section>
    </main>
  );
}
