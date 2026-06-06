import type { ReactNode } from "react";
import type { Intervention } from "@/lib/types";
import { getLever } from "@/lib/interventions";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-700">{value}</span>
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
    <div className="elev-raised rounded-2xl border border-neutral-200/80 bg-white p-5">
      <p className="text-eyebrow text-neutral-400">Kairos recommends</p>

      {/* Discrimination is the centerpiece: chosen vs deliberately rejected. */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-900 bg-neutral-900 p-4 text-white">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Chosen lever
          </p>
          <p className="mt-1 text-base font-semibold">{intervention.leverName}</p>
          {summary && (
            <p className="mt-1 text-sm text-neutral-400">{summary}</p>
          )}
        </div>

        {hasRejected && (
          <div className="rounded-xl border border-dashed border-neutral-200 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Deliberately not
            </p>
            <p className="mt-1 text-base font-semibold text-neutral-400 line-through">
              {rejected.leverName}
            </p>
            {rejected.why && (
              <p className="mt-1 text-sm text-neutral-500">{rejected.why}</p>
            )}
          </div>
        )}
      </div>

      {/* Predicted moment: one bold line, one small justification. */}
      {hasMoment && (
        <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-inset ring-amber-600/15">
          <p className="text-[11px] font-medium uppercase tracking-wider text-amber-700">
            Predicted slip
          </p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900">
            {predictedMoment}
          </p>
          {timing && (
            <p className="mt-0.5 text-xs text-neutral-500">
              Nudge fires {timing}
            </p>
          )}
        </div>
      )}

      {/* Pattern memory grounds the lever choice in this person's real past. */}
      {memory && <div className="mt-3">{memory}</div>}

      <div className="mt-4">
        <p className="text-[15px] leading-relaxed text-neutral-800">
          {intervention.reasoning}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          <Meta label="Channel" value={intervention.channel} />
          {!hasMoment && timing && (
            <>
              <span className="text-neutral-200">·</span>
              <Meta label="Timing" value={timing} />
            </>
          )}
          <span className="text-neutral-200">·</span>
          <Meta label="Tone" value={intervention.tone} />
        </div>
      </div>
    </div>
  );
}
