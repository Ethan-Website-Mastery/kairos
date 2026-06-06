/**
 * CSS-only iPhone lock screen showing the nudge as the client receives it.
 * No images/assets — frame, Dynamic Island, dawn-gradient wallpaper, clock and
 * the iOS notification are all CSS. Props/behaviour unchanged.
 */
export default function PhoneMock({
  message,
  channel,
}: {
  message: string;
  channel: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[256px]">
      {/* Device body */}
      <div className="relative rounded-[2.9rem] bg-neutral-950 p-[10px] shadow-[0_20px_60px_-18px_rgba(15,23,42,0.55)] ring-1 ring-white/10">
        {/* Side buttons */}
        <span className="absolute -left-[3px] top-[120px] h-7 w-[3px] rounded-l bg-neutral-800" />
        <span className="absolute -left-[3px] top-[164px] h-12 w-[3px] rounded-l bg-neutral-800" />
        <span className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r bg-neutral-800" />

        {/* Screen — calm dawn wallpaper tied to Maya's 7am window */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.3rem] bg-gradient-to-b from-[#243352] via-[#7d6f8d] to-[#f6c79a]">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-3 h-[26px] w-[84px] -translate-x-1/2 rounded-full bg-black shadow-inner" />

          {/* Lock-screen clock + date */}
          <div className="px-5 pt-14 text-center text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.25)]">
            <p className="text-xs font-medium tracking-wide text-white/90">
              Thursday, 12 June
            </p>
            <p className="mt-0.5 text-[64px] font-semibold leading-none tracking-tight tabular-nums">
              7:00
            </p>
          </div>

          {/* iOS notification — the glass shines here */}
          <div className="absolute inset-x-3 bottom-4 animate-notif">
            <div className="glass-strong flex items-start gap-2.5 rounded-[1.25rem] p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-neutral-900 text-sm font-bold text-white shadow-sm">
                K
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-neutral-900">
                    Kairos
                  </span>
                  <span className="shrink-0 text-[10px] text-neutral-500">
                    now
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-neutral-800">
                  {message}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">
                  via {channel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
