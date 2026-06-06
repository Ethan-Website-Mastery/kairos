import Link from "next/link";
import type { ReactNode } from "react";
import { clients, riskOf } from "@/lib/data";
import { FALLBACKS } from "@/lib/interventions";
import RosterCard from "@/components/RosterCard";
import RosterPulse from "@/components/RosterPulse";
import {
  UsersIcon,
  AlertIcon,
  EyeIcon,
  CheckIcon,
  PlusIcon,
} from "@/components/icons";

const SHORT_LEVER: Record<string, string> = {
  friction: "Friction",
  loss_aversion: "Loss aversion",
  identity_framing: "Identity",
  cue_trigger: "Cue",
  habit_stacking: "Habit stack",
  rewards: "Reward",
  commitment_device: "Commitment",
  social_accountability: "Accountability",
  timing: "Timing",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Living roster — the memorability signature */}
      <div className="mb-6">
        <RosterPulse />
      </div>

      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
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

      {/* Stat-card row — real values from riskOf */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total clients" value={total} icon={<UsersIcon className="h-4 w-4" />} />
        <StatCard
          label="Needs attention"
          value={high}
          icon={<AlertIcon className="h-4 w-4" />}
          accent="rose"
        />
        <StatCard
          label="To watch"
          value={medium}
          icon={<EyeIcon className="h-4 w-4" />}
          tone="amber"
        />
        <StatCard
          label="On track"
          value={low}
          icon={<CheckIcon className="h-4 w-4" />}
          tone="emerald"
        />
      </div>

      {/* Widget grid */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Roster widget (spans two columns) */}
        <section className="lg:col-span-2">
          {attention.length > 0 && (
            <>
              <h2 className="mb-3 text-eyebrow text-neutral-400">
                Needs attention
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {attention.map(({ client }, i) => (
                  <RosterCard
                    key={client.id}
                    client={client}
                    className={
                      attention.length % 2 === 1 &&
                      i === attention.length - 1
                        ? "sm:col-span-2"
                        : ""
                    }
                  />
                ))}
              </div>
            </>
          )}

          {onTrack.length > 0 && (
            <>
              <h2 className="mb-3 mt-7 text-eyebrow text-neutral-400">
                On track
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {onTrack.map(({ client }) => (
                  <RosterCard key={client.id} client={client} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Right column: health + attention queue */}
        <div className="flex flex-col gap-5">
          {/* Roster-health widget */}
          <div className="elev-card rounded-2xl border border-neutral-200/70 bg-white p-5">
            <h2 className="text-eyebrow text-neutral-400">Roster health</h2>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-neutral-100">
              {high > 0 && (
                <div className="bg-rose-500" style={{ width: pct(high) }} />
              )}
              {medium > 0 && (
                <div className="bg-amber-400" style={{ width: pct(medium) }} />
              )}
              {low > 0 && (
                <div className="bg-emerald-500" style={{ width: pct(low) }} />
              )}
            </div>
            <div className="mt-3 flex flex-col gap-1.5 text-xs text-neutral-500">
              <Legend dot="bg-rose-500" label="High" n={high} />
              <Legend dot="bg-amber-400" label="Medium" n={medium} />
              <Legend dot="bg-emerald-500" label="On track" n={low} />
            </div>
          </div>

          {/* Attention queue widget — drafted lever + moment, from the engine */}
          <div className="elev-card rounded-2xl border border-neutral-200/70 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-eyebrow text-neutral-400">Attention queue</h2>
              <span className="text-xs font-medium text-neutral-400">
                {attention.length}
              </span>
            </div>
            <ul className="mt-2 flex flex-col divide-y divide-neutral-100">
              {attention.map(({ client, risk }) => {
                const fb = FALLBACKS[client.id];
                const lever = fb
                  ? SHORT_LEVER[fb.leverId] ?? fb.leverName
                  : "Drafting";
                const moment = client.signals.openWindows[0] ?? "—";
                const dot =
                  risk.level === "High"
                    ? "bg-rose-500"
                    : risk.level === "Medium"
                      ? "bg-amber-500"
                      : "bg-emerald-500";
                return (
                  <li key={client.id}>
                    <Link
                      href={`/client/${client.id}`}
                      className="-mx-1.5 flex items-center gap-3 rounded-lg px-1.5 py-2.5 transition-colors hover:bg-neutral-50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                        {initials(client.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {client.name}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {lever} · {moment}
                        </p>
                      </div>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent?: "rose";
  tone?: "amber" | "emerald";
}) {
  if (accent === "rose") {
    return (
      <div className="rounded-2xl bg-rose-500 p-5 text-white shadow-[0_10px_34px_-12px_rgba(225,29,72,0.55)]">
        <span className="inline-flex rounded-lg bg-white/20 p-1.5">{icon}</span>
        <p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-rose-50">{label}</p>
      </div>
    );
  }
  const chip =
    tone === "amber"
      ? "bg-amber-100 text-amber-600"
      : tone === "emerald"
        ? "bg-emerald-100 text-emerald-600"
        : "bg-neutral-100 text-neutral-500";
  return (
    <div className="elev-card rounded-2xl border border-neutral-200/70 bg-white p-5">
      <span className={`inline-flex rounded-lg p-1.5 ${chip}`}>{icon}</span>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-neutral-900">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
      <span className="ml-auto font-medium text-neutral-700">{n}</span>
    </span>
  );
}
