import PhoneMock from "./PhoneMock";

/**
 * The client's side: how the nudge arrives and how they act on it. CSS-only —
 * the tap target flips to a confirmation via a hidden checkbox + peer, so no JS
 * state is needed. Honestly framed as a preview, not a shipped client app.
 */
export default function ClientPreview({
  id,
  firstName,
  message,
  channel,
  actionLabel,
  confirmText,
}: {
  id: string;
  firstName: string;
  message: string;
  channel: string;
  actionLabel: string;
  confirmText: string;
}) {
  const cbId = `lockin-${id}`;

  return (
    <div className="elev-card rounded-2xl border border-neutral-200/80 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-eyebrow text-neutral-400">Client preview</p>
        <span className="text-xs text-neutral-400">
          How {firstName} receives it
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-4">
        {/* 1 — the nudge arrives (real generated message) */}
        <PhoneMock message={message} channel={channel} />

        {/* 2 — her quick action → confirmation (CSS-only) */}
        <input id={cbId} type="checkbox" className="peer sr-only" />

        <div className="flex w-full max-w-[280px] flex-col items-center gap-2 peer-checked:hidden">
          <label
            htmlFor={cbId}
            className="w-full cursor-pointer rounded-xl bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            {actionLabel}
          </label>
          <label
            htmlFor={cbId}
            className="cursor-pointer text-xs text-neutral-400 transition-colors hover:text-neutral-900"
          >
            I&apos;m in
          </label>
        </div>

        <div className="hidden w-full max-w-[280px] items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200/70 peer-checked:flex">
          <span aria-hidden>✓</span>
          {confirmText}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-neutral-400">
        Preview only — illustration of the client&apos;s side, not a shipped app.
      </p>
    </div>
  );
}
