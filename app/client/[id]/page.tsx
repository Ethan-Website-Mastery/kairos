import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/data";
import RiskBadge from "@/components/RiskBadge";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
      >
        &larr; Roster
      </Link>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {client.name}
        </h1>
        <RiskBadge level={client.risk} />
      </div>
      <p className="mt-2 text-sm text-neutral-500">{client.weeklyGoal}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-10 text-center">
        <p className="text-sm text-neutral-500">
          Client detail, prediction, and interventions land in a later brief.
        </p>
      </div>
    </main>
  );
}
