"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Client, Intervention } from "@/lib/types";
import { computeRisk } from "@/lib/risk";
import { improvedSignals, buildLoopEvents, leverTrackRecord } from "@/lib/loop";
import InterventionCard from "./InterventionCard";
import PatternMemory from "./PatternMemory";
import ClientPreview from "./ClientPreview";
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

  // Track record: honest count of prior successes with this lever for this
  // person (0 = a new play). Never a fabricated number.
  const trackRecord = intervention
    ? leverTrackRecord(intervention.leverId, client.signals.history)
    : 0;

  // Payoff animation — only runs once the coach approves & sends.
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
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-neutral-300">
          {firstName} is on track — Kairos is monitoring and hasn&apos;t flagged
          anything.
        </p>
        <button
          onClick={draft}
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-200"
        >
          Draft one anyway
        </button>
      </div>
    );
  }

  if (drafting) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-neutral-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400" />
        Kairos noticed the risk and is drafting a nudge…
      </div>
    );
  }

  if (!intervention) {
    return (
      <button
        onClick={draft}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
      >
        Draft intervention
      </button>
    );
  }

  const steps = buildLoopEvents(client, before, intervention, trackRecord);

  // Honest, deterministic track-record line — no invented ratio.
  const lever = intervention.leverName;
  const times =
    trackRecord === 1 ? "once" : trackRecord === 2 ? "twice" : `${trackRecord} times`;
  const trackLine =
    trackRecord > 0
      ? `${lever} has worked for ${firstName} ${times} before — Kairos logs this as success #${trackRecord + 1} and weights it higher.`
      : `${lever} is a new play for ${firstName} — Kairos weights it higher with each success.`;

  return (
    <div className="flex flex-col gap-4">
      {!approved && (
        <>
          {/* Proactive frame: Kairos already noticed and drafted. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-rose-500/10 px-4 py-2.5 ring-1 ring-inset ring-rose-400/25">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            <span className="text-sm font-medium text-neutral-100">
              Kairos flagged this client
            </span>
            <span className="text-sm text-neutral-400">
              · Drafted intervention — awaiting your approval
            </span>
          </div>

          <InterventionCard
            intervention={intervention}
            memory={<PatternMemory client={client} />}
          />

          <ClientPreview
            id={client.id}
            firstName={firstName}
            message={intervention.message}
            channel={intervention.channel}
            actionLabel={
              client.signals.openWindows[0]
                ? `Lock ${client.signals.openWindows[0]}`
                : "I'm in"
            }
            confirmText={
              client.signals.openWindows[0]
                ? `Locked in — see you ${client.signals.openWindows[0]}.`
                : "You're in — let's go."
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setApproved(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              Approve &amp; send
            </button>
            <button
              onClick={draft}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
            >
              Adjust
            </button>
            <button
              onClick={toggleHow}
              className="ml-auto text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-100"
            >
              {showHow ? "Hide" : "How Kairos decided"}
            </button>
          </div>

          {showHow && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
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
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400" />
                        )}
                      </span>
                      <span
                        className={
                          i === 1 || i === 3
                            ? "font-medium text-neutral-100"
                            : "text-neutral-400"
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
          {/* THE CLIMAX — the lever's track record for this person grows. An
              honest count from history, not a fabricated percentage. */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 to-transparent p-6 ring-1 ring-emerald-400/30 shadow-[0_0_40px_-12px_rgba(16,185,129,0.4)]">
            <p className="text-eyebrow text-emerald-300">Track record</p>
            <p className="mt-2 text-[15px] font-medium leading-relaxed text-neutral-100">
              {trackLine}
            </p>

            {/* one pip per logged success: prior wins + this newly confirmed one */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {Array.from({ length: trackRecord }, (_, i) => (
                <span
                  key={`prior-${i}`}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-xs font-bold text-emerald-300"
                >
                  ✓
                </span>
              ))}
              <span className="animate-rise flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-xs font-bold text-neutral-950 ring-2 ring-emerald-400/40">
                ✓
              </span>
              <span className="ml-1 text-sm text-neutral-400">
                logged as #{trackRecord + 1}, weighted higher
              </span>
            </div>

            {/* honest follow-through action */}
            <span className="animate-flash mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-emerald-400/30">
              <span className="text-neutral-400">{firstName} logged the session</span>
              <span className="font-semibold tabular-nums text-neutral-100">
                {sessVal}/{client.signals.weeklyGoal}
              </span>
            </span>
          </div>

          {/* The flywheel */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="mb-4 text-sm font-medium text-neutral-400">
              Closing the loop
            </p>
            <LoopTimeline steps={steps} />
          </div>

          <button
            onClick={() => setApproved(false)}
            className="self-start text-xs text-neutral-500 transition-colors hover:text-neutral-200"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
