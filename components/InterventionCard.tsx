import type { ReactNode } from "react";
import type { Intervention } from "@/lib/types";
import { getLever } from "@/lib/interventions";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-200">{value}</span>
    </span>
  );
}

export default function InterventionCard({
  intervention,
  memory,
}: {
  intervention: Intervention;
  /** Optional "Kairos remembers …" element, shown above the reasoning. */
  memory?: ReactNode;
}) {
  const { rejected, predictedMoment, timing } = intervention;
  const hasRejected = Boolean(rejected?.leverName);
  const hasMoment = Boolean(predictedMoment);
  // The library summary gives the chosen box its "why this lever" line.
  const summary = getLever(intervention.leverId)?.summary;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-eyebrow text-neutral-500">Kairos recommends</p>

      {/* Discrimination is the centerpiece: chosen vs deliberately rejected. */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-white">
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-300/80">
            Chosen lever
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {intervention.leverName}
          </p>
          {summary && <p className="mt-1 text-sm text-neutral-300">{summary}</p>}
        </div>

        {hasRejected && (
          <div className="rounded-xl border border-dashed border-white/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
              Deliberately not
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-500 line-through">
              {rejected.leverName}
            </p>
            {rejected.why && (
              <p className="mt-1 text-sm text-neutral-400">{rejected.why}</p>
            )}
          </div>
        )}
      </div>

      {/* Predicted moment: one bold line, one small justification. */}
      {hasMoment && (
        <div className="mt-3 rounded-xl bg-amber-500/10 px-4 py-3 ring-1 ring-inset ring-amber-400/25">
          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-300">
            Predicted slip
          </p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-100">
            {predictedMoment}
          </p>
          {timing && (
            <p className="mt-0.5 text-xs text-neutral-400">Nudge fires {timing}</p>
          )}
        </div>
      )}

      {/* Pattern memory grounds the lever choice in this person's real past. */}
      {memory && <div className="mt-3">{memory}</div>}

      <div className="mt-4">
        {/* Why THIS lever — the logic, as terse beats. Distinct from the
            "Why — top drivers" list (that = why she's at risk). */}
        {intervention.reasoningBullets.length > 0 && (
          <>
            <p className="mb-2 text-eyebrow text-neutral-400">Why this lever</p>
            <ul className="flex flex-col gap-1.5">
              {intervention.reasoningBullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-sm leading-snug text-neutral-200"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <Meta label="Channel" value={intervention.channel} />
          {!hasMoment && timing && (
            <>
              <span className="text-neutral-700">·</span>
              <Meta label="Timing" value={timing} />
            </>
          )}
          <span className="text-neutral-700">·</span>
          <Meta label="Tone" value={intervention.tone} />
        </div>
      </div>
    </div>
  );
}
