import type { Intervention } from "@/lib/types";
import PhoneMock from "./PhoneMock";

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
}: {
  intervention: Intervention;
}) {
  const { rejected, predictedMoment, timing } = intervention;
  const hasRejected = Boolean(rejected?.leverName);
  const hasMoment = Boolean(predictedMoment);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6">
      <p className="text-sm font-medium text-neutral-500">Kairos recommends</p>

      {/* Discrimination is the centerpiece: chosen vs deliberately rejected. */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-900 bg-neutral-900 p-4 text-white">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Chosen lever
          </p>
          <p className="mt-1 text-base font-semibold">{intervention.leverName}</p>
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

      {/* Predicted moment of vulnerability, with the nudge timed just before it. */}
      {hasMoment && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-neutral-700 ring-1 ring-inset ring-amber-600/15">
          <span className="font-medium text-amber-700">Predicted slip:</span>{" "}
          {predictedMoment}
          {timing && (
            <>
              {" "}
              <span className="text-amber-700">→</span> nudge fires{" "}
              <span className="font-medium text-neutral-900">{timing}</span>
            </>
          )}
        </p>
      )}

      <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-[15px] leading-relaxed text-neutral-800">
            {intervention.reasoning}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
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

        <PhoneMock message={intervention.message} channel={intervention.channel} />
      </div>
    </div>
  );
}
