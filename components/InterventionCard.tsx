import type { Intervention } from "@/lib/types";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-200">{value}</span>
    </span>
  );
}

/** Lead with the decision as a big, glanceable contrast. Depth (reasoning
 *  bullets, pattern memory) lives in the "How Kairos decided" expander. */
export default function InterventionCard({
  intervention,
}: {
  intervention: Intervention;
}) {
  const { rejected, predictedMoment, timing, reasoningBullets } = intervention;
  const hasRejected = Boolean(rejected?.leverName);
  // One-line diagnosis = the lead of the first reasoning bullet.
  const diagnosis = reasoningBullets[0]?.split("—")[0].trim();
  // Big moment chip = the lead of the predicted-slip line (e.g. "Thursday 7am").
  const momentBig = predictedMoment ? predictedMoment.split("—")[0].trim() : "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-eyebrow text-neutral-500">Kairos recommends</p>

      {/* HERO — the decision, biggest thing on the page */}
      <div className="mt-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-bold text-emerald-300 sm:text-3xl">
            {intervention.leverName}
          </span>
          {hasRejected && (
            <span className="text-sm text-neutral-500">
              not <span className="line-through">{rejected.leverName}</span>
            </span>
          )}
        </div>
        {diagnosis && (
          <p className="mt-1.5 text-sm text-neutral-300">{diagnosis}</p>
        )}
      </div>

      {/* Moment — big chip + small timing */}
      {momentBig && (
        <div className="mt-5">
          <p className="text-eyebrow text-neutral-500">Predicted slip</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-amber-500/15 px-4 py-2 text-lg font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/30">
              {momentBig}
            </span>
            {timing && (
              <span className="text-xs text-neutral-400">
                nudge fires {timing}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <Meta label="Channel" value={intervention.channel} />
        <span className="text-neutral-700">·</span>
        <Meta label="Tone" value={intervention.tone} />
      </div>
    </div>
  );
}
