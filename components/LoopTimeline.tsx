import type { LoopStep } from "@/lib/loop";

/** CSS-only vertical timeline of the predict → intervene → learn cycle. */
export default function LoopTimeline({ steps }: { steps: LoopStep[] }) {
  return (
    <ol className="relative">
      {/* connecting line */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200"
      />
      {steps.map((step, i) => (
        <li
          key={step.label}
          className="animate-rise relative flex gap-4 pb-5 last:pb-0"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <span className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
            <span
              className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                step.highlight ? "bg-emerald-500" : "bg-neutral-900"
              }`}
            />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="flex items-center gap-2 text-sm font-medium text-neutral-900">
              <span className="text-xs tabular-nums text-neutral-300">
                {i + 1}
              </span>
              {step.label}
            </p>
            <p
              className={`text-sm ${
                step.highlight
                  ? "font-medium text-emerald-700"
                  : "text-neutral-500"
              }`}
            >
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
