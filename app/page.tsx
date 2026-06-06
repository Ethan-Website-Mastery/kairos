import { clients, riskOf } from "@/lib/data";
import RosterCard from "@/components/RosterCard";

export default function Dashboard() {
  const atRisk = clients.filter((c) => riskOf(c).level !== "Low").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-400">Kairos</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            Coach dashboard
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {clients.length} clients &middot; {atRisk} need attention
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clients.map((client) => (
          <RosterCard key={client.id} client={client} />
        ))}
      </section>
    </main>
  );
}
