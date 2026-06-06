/** Lightweight CSS phone frame showing the nudge as the client receives it. */
export default function PhoneMock({
  message,
  channel,
}: {
  message: string;
  channel: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2.25rem] border border-neutral-200 bg-neutral-900 p-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-neutral-800 to-neutral-700 px-3 pb-6 pt-8">
          {/* notch */}
          <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-900/70" />

          <p className="mb-2 text-center text-xs font-medium text-neutral-300">
            9:41
          </p>

          {/* notification — slides down + fades like a real push arriving */}
          <div className="animate-notif rounded-2xl bg-white/95 p-3 backdrop-blur">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-[10px] font-bold text-white">
                K
              </span>
              <span className="text-xs font-semibold text-neutral-900">
                Kairos
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-wide text-neutral-400">
                {channel}
              </span>
            </div>
            <p className="text-[13px] leading-snug text-neutral-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
