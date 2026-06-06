"use client";

import { useEffect, useMemo, useState } from "react";
import type { Client, Intervention } from "@/lib/types";
import { computeRisk } from "@/lib/risk";
import { improvedSignals, buildLoopEvents } from "@/lib/loop";
import InterventionCard from "./InterventionCard";
import LoopTimeline from "./LoopTimeline";
import RiskBadge from "./RiskBadge";

/** Animate an integer from `from` to `to` once `run` flips true (eased). */
function useCountTo(from: number, to: number, run: boolean, duration = 600) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!run) {
      const reset = requestAnimationFrame(() => setValue(from));
      return () => cancelAnimationFrame(reset);
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, run, duration]);
  return value;
}

/** Same thresholds as the risk model (HIGH ≥ 65, MEDIUM ≥ 30). */
function colorForScore(score: number): string {
  if (score >= 65) return "bg-rose-500";
  if (score >= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

const REVEAL_LAST = 4; // index of the final reveal step
const REVEAL_INTERVAL = 500;

export default function InterventionPanel({ client }: { client: Client }) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [reasoning, setReasoning] = useState(false);
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState<Intervention | null>(null);
  const [looped, setLooped] = useState(false);

  // The loop runs entirely in React state — no server route, no module-level
  // cache that could evaporate between serverless invocations mid-demo.
  const before = useMemo(
    () => computeRisk(client.signals, client.signals.history),
    [client],
  );
  const improved = useMemo(() => improvedSignals(client.signals), [client]);
  const after = useMemo(
    () => computeRisk(improved, client.signals.history),
    [improved, client.signals.history],
  );

  // Payoff animations — only run once the loop is simulated.
  const scoreVal = useCountTo(before.score, after.score, looped);
  const sessVal = useCountTo(
    client.signals.sessionsLogged,
    improved.sessionsLogged,
    looped,
  );

  // Advance the reveal one step every ~500ms, stopping at the last step.
  useEffect(() => {
    if (!reasoning || step >= REVEAL_LAST) return;
    const id = setTimeout(
      () => setStep((s) => Math.min(s + 1, REVEAL_LAST)),
      REVEAL_INTERVAL,
    );
    return () => clearTimeout(id);
  }, [reasoning, step]);

  // Resolve to the card only when the call has returned AND the reveal has
  // played through — so a fast/offline result still gets the full cinematic,
  // and a slow one holds on the last step until it arrives. Never deadlocks.
  useEffect(() => {
    if (!(reasoning && pending && step >= REVEAL_LAST)) return;
    const id = setTimeout(() => {
      setIntervention(pending);
      setReasoning(false);
    }, 0);
    return () => clearTimeout(id);
  }, [reasoning, pending, step]);

  async function generate() {
    setLooped(false);
    setIntervention(null);
    setPending(null);
    setStep(0);
    setReasoning(true);
    try {
      const res = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      // Route never 500s — it always returns a renderable intervention.
      setPending(await res.json());
    } catch {
      // Network died entirely; bail out of the reveal back to the button.
      setReasoning(false);
    }
  }

  const firstName = client.name.split(" ")[0];
  const topDrivers =
    before.drivers
      .slice(0, 3)
      .map((d) => d.label)
      .join(" · ") || "no active risk drivers";

  function stepText(i: number): string {
    switch (i) {
      case 0:
        return `Reading ${firstName}'s signals…`;
      case 1:
        return topDrivers;
      case 2:
        return "Diagnosing failure type…";
      case 3:
        return pending && pending.rejected.leverName
          ? `Ruling out ${pending.rejected.leverName}${
              pending.rejected.why ? ` — ${pending.rejected.why}` : ""
            }`
          : "Ruling out the wrong lever…";
      default:
        return "Selecting the right lever ✓";
    }
  }

  if (reasoning) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-6">
        <div className="mb-4 flex items-center gap-3 text-sm font-medium text-neutral-900">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
          Kairos is reasoning
        </div>
        <ul className="flex flex-col gap-2.5">
          {Array.from({ length: step + 1 }, (_, i) => i).map((i) => {
            const done = i < step || (i === REVEAL_LAST && Boolean(pending));
            return (
              <li
                key={i}
                className="animate-rise flex items-start gap-2.5 text-sm"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {done ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-700" />
                  )}
                </span>
                <span
                  className={
                    i === 1 || i === 3
                      ? "font-medium text-neutral-900"
                      : "text-neutral-600"
                  }
                >
                  {stepText(i)}
                </span>
              </li>
            );
          })}
        </ul>
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
        <div className="flex flex-col gap-4">
          {/* THE CLIMAX — risk falls. The single most dramatic moment. */}
          <div className="elev-climax overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-6 ring-1 ring-emerald-200/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-eyebrow text-emerald-700">
                  Risk after follow-through
                </p>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl font-semibold tabular-nums text-neutral-300 line-through">
                    {before.score}
                  </span>
                  <span className="text-2xl text-emerald-500">↓</span>
                  <span className="text-6xl font-bold tabular-nums leading-none text-neutral-900">
                    {scoreVal}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700">
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

            {/* bar tracks the count-down, colour shifts red → amber → green */}
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200/60">
              <div
                className={`h-full rounded-full transition-all duration-300 ${colorForScore(scoreVal)}`}
                style={{ width: `${scoreVal}%` }}
              />
            </div>

            {/* session ticks up with a brief highlight */}
            <span className="animate-flash mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-emerald-200/60">
              <span className="text-neutral-500">Sessions</span>
              <span className="font-semibold tabular-nums text-neutral-900">
                {sessVal}/{client.signals.weeklyGoal}
              </span>
            </span>
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
