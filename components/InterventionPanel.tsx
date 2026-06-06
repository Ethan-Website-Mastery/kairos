"use client";

import { useMemo, useState } from "react";
import type { Client, Intervention } from "@/lib/types";
import { computeRisk } from "@/lib/risk";
import { improvedSignals, buildLoopEvents } from "@/lib/loop";
import InterventionCard from "./InterventionCard";
import LoopTimeline from "./LoopTimeline";
import RiskBadge from "./RiskBadge";

export default function InterventionPanel({ client }: { client: Client }) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(false);
  const [looped, setLooped] = useState(false);

  // The loop runs entirely in React state — no server route, no module-level
  // cache that could evaporate between serverless invocations mid-demo.
  const before = useMemo(
    () => computeRisk(client.signals, client.signals.history),
    [client],
  );
  const after = useMemo(
    () => computeRisk(improvedSignals(client.signals), client.signals.history),
    [client],
  );

  async function generate() {
    setLoading(true);
    setLooped(false);
    try {
      const res = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      // Route never 500s — it always returns a renderable intervention.
      setIntervention(await res.json());
    } catch {
      // Network died entirely; leave the button available to retry.
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-6 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
        Kairos is choosing the right lever…
      </div>
    );
  }

  if (!intervention) {
    return (
      <button
        onClick={generate}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        Generate intervention
      </button>
    );
  }

  const drop = before.score - after.score;
  const steps = buildLoopEvents(client, before, intervention, after);

  return (
    <div className="flex flex-col gap-4">
      <InterventionCard intervention={intervention} />

      {!looped ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLooped(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
          >
            Simulate client response
          </button>
          <button
            onClick={generate}
            className="text-xs text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Regenerate
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Updated risk with a clear drop */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Risk after follow-through
              </p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums text-neutral-400 line-through">
                  {before.score}
                </span>
                <span className="text-emerald-600">↓</span>
                <span className="text-3xl font-semibold tabular-nums text-neutral-900">
                  {after.score}
                </span>
                <span className="text-sm font-medium text-emerald-700">
                  −{drop}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={before.level} />
              <span className="text-neutral-300">→</span>
              <RiskBadge level={after.level} />
            </div>
          </div>

          {/* The flywheel */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6">
            <p className="mb-4 text-sm font-medium text-neutral-500">
              Closing the loop
            </p>
            <LoopTimeline steps={steps} />
          </div>

          <button
            onClick={() => setLooped(false)}
            className="self-start text-xs text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
