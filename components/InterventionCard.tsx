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
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">Kairos recommends</p>
        <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
          {intervention.leverName}
        </span>
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          {/* The reasoning is the differentiator — make it the centerpiece. */}
          <p className="text-[15px] leading-relaxed text-neutral-800">
            {intervention.reasoning}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <Meta label="Channel" value={intervention.channel} />
            <span className="text-neutral-200">·</span>
            <Meta label="Timing" value={intervention.timing} />
            <span className="text-neutral-200">·</span>
            <Meta label="Tone" value={intervention.tone} />
          </div>
        </div>

        <PhoneMock message={intervention.message} channel={intervention.channel} />
      </div>
    </div>
  );
}
