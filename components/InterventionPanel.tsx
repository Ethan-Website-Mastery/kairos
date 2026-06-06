"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Client, Intervention } from "@/lib/types";
import { computeRisk } from "@/lib/risk";
import {
  improvedSignals,
  buildLoopEvents,
  leverConfidence,
  confidenceAfter,
} from "@/lib/loop";
import InterventionCard from "./InterventionCard";
import PatternMemory from "./PatternMemory";
import LoopTimeline from "./LoopTimeline";

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

const REVEAL_LAST = 4; // index of the final reveal step
const REVEAL_INTERVAL = 500;

export default function InterventionPanel({ client }: { client: Client }) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const drafted = useRef(false);

  // The loop runs entirely in React state — no server route, no module-level
  // cache that could evaporate between serverless invocations mid-demo.
  const before = useMemo(
    () => computeRisk(client.signals, client.signals.history),
    [client],
  );
  const improved = useMemo(() => improvedSignals(client.signals), [client]);

  const atRisk = before.level !== "Low";
  const firstName = client.name.split(" ")[0];

  // Confidence is grounded in this person's history, not a magic number.
  const conf = intervention
    ? leverConfidence(intervention.leverId, client.signals.history)
    : 0;
  const confNext = intervention ? confidenceAfter(conf) : 0;

  // Payoff animations — only run once the coach approves & sends.
  const confVal = useCountTo(conf, confNext, approved);
  const sessVal = useCountTo(
    client.signals.sessionsLogged,
    improved.sessionsLogged,
    approved,
  );

  async function draft() {
    setApproved(false);
    setShowHow(false);
    setRevealStep(0);
    setDrafting(true);
    try {
      const res = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      // Route never 500s — it always returns a renderable intervention.
      setIntervention(await res.json());
    } catch {
      // Network died entirely; surface the draft button to retry.
    } finally {
      setDrafting(false);
    }
  }

  // Proactive agent: for an at-risk client, Kairos drafts on its own — no
  // "Generate" click. The live engine call happens under the hood, once.
  useEffect(() => {
    if (atRisk && !drafted.current) {
      drafted.current = true;
      draft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atRisk]);

  // "How Kairos decided" replays the staged reasoning when expanded.
  useEffect(() => {
    if (!showHow || revealStep >= REVEAL_LAST) return;
    const id = setTimeout(
      () => setRevealStep((s) => Math.min(s + 1, REVEAL_LAST)),
      REVEAL_INTERVAL,
    );
    return () => clearTimeout(id);
  }, [showHow, revealStep]);

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
        return intervention && intervention.rejected.leverName
          ? `Ruled out ${intervention.rejected.leverName}${
              intervention.rejected.why ? ` — ${intervention.rejected.why}` : ""
            }`
          : "Ruling out the wrong lever…";
      default:
        return `Selected ${intervention?.leverName ?? "the right lever"} ✓`;
    }
  }

  function toggleHow() {
    setRevealStep(0);
    setShowHow((o) => !o);
  }

  // Low-risk client: nothing to do but watch.
  if (!atRisk && !intervention && !drafting) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200/80 bg-white p-6">
        <p className="text-sm text-neutral-600">
          {firstName} is on track — Kairos is monitoring and hasn&apos;t flagged
          anything.
        </p>
        <button
          onClick={draft}
          className="text-xs text-neutral-400 transition-colors hover:text-neutral-900"
        >
          Draft one anyway
        </button>
      </div>
    );
  }

  if (drafting) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-6 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
        Kairos noticed the risk and is drafting a nudge…
      </div>
    );
  }

  if (!intervention) {
    return (
      <button
        onClick={draft}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
      >
        Draft intervention
      </button>
    );
  }

  const steps = buildLoopEvents(client, before, intervention, conf, confNext);

  return (
    <div className="flex flex-col gap-4">
      {!approved && (
        <>
          {/* Proactive frame: Kairos already noticed and drafted. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-rose-50 px-4 py-2.5 ring-1 ring-inset ring-rose-100">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-sm font-medium text-neutral-900">
              Kairos flagged this client
            </span>
            <span className="text-sm text-neutral-500">
              · Drafted intervention — awaiting your approval
            </span>
          </div>

          <InterventionCard
            intervention={intervention}
            memory={<PatternMemory client={client} />}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setApproved(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Approve &amp; send
            </button>
            <button
              onClick={draft}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              Adjust
            </button>
            <button
              onClick={toggleHow}
              className="ml-auto text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-900"
            >
              {showHow ? "Hide" : "How Kairos decided"}
            </button>
          </div>

          {showHow && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6">
              <p className="mb-4 text-eyebrow text-neutral-400">
                How Kairos decided
              </p>
              <ul className="flex flex-col gap-2.5">
                {Array.from({ length: revealStep + 1 }, (_, i) => i).map((i) => {
                  const done = i < revealStep || revealStep >= REVEAL_LAST;
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
          )}
        </>
      )}

      {approved && (
        <div className="flex flex-col gap-4">
          {/* THE CLIMAX — confidence rises. The system's belief, not a behaviour
              prediction. */}
          <div className="elev-climax overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-6 ring-1 ring-emerald-200/80">
            <p className="text-eyebrow text-emerald-700">
              Confidence in this lever
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Kairos&apos;s belief that {intervention.leverName} works for{" "}
              {firstName} — grounded in her history, not a prediction of her
              behaviour.
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-semibold tabular-nums text-neutral-300 line-through">
                {conf}%
              </span>
              <span className="text-2xl text-emerald-500">↑</span>
              <span className="text-6xl font-bold tabular-nums leading-none text-neutral-900">
                {confVal}%
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700">
                +{confNext - conf}
              </span>
            </div>

            {/* bar tracks the confidence rise */}
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-neutral-200/60">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${confVal}%` }}
              />
            </div>

            {/* honest follow-through action (not a risk claim) */}
            <span className="animate-flash mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-emerald-200/60">
              <span className="text-neutral-500">{firstName} logged the session</span>
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
            onClick={() => setApproved(false)}
            className="self-start text-xs text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
