"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "scanning" | "locked";

/**
 * The cinematic "catch": on click, Kairos sweeps the roster, locks onto the
 * about-to-slip client, flags her, and flows into her detail page. Overlay
 * covers the (relative) command-center band. Detail page itself is untouched.
 */
export default function CatchMoment({
  clientId = "maya-okafor",
  name = "Maya Okafor",
}: {
  clientId?: string;
  name?: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  function run() {
    if (phase !== "idle") return;
    setPhase("scanning");
    timers.current.push(setTimeout(() => setPhase("locked"), 1300));
    timers.current.push(setTimeout(() => router.push(`/client/${clientId}`), 3000));
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const firstName = name.split(" ")[0];

  return (
    <>
      <button
        onClick={run}
        disabled={phase !== "idle"}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/10 disabled:opacity-50"
      >
        <span aria-hidden>▶</span> Run live scan
      </button>

      {phase !== "idle" && (
        <div className="animate-notif absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-950/85 px-6 text-center backdrop-blur-sm">
          {phase === "scanning" ? (
            <>
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
              <p className="text-eyebrow text-neutral-400">Scanning roster…</p>
              <p className="text-sm text-neutral-300">
                8 clients · reading signals
              </p>
            </>
          ) : (
            <>
              <span className="relative flex h-20 w-20 items-center justify-center">
                <span
                  aria-hidden
                  className="ping-ring absolute inset-0 rounded-full border-2 border-rose-500"
                />
                <span className="pulse-alert flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-500 bg-neutral-900 text-xl font-semibold text-white">
                  {initials}
                </span>
              </span>
              <p className="text-eyebrow text-rose-400">⚠ Flagged · high risk</p>
              <p className="text-xl font-semibold text-white">
                Kairos flagged {firstName}
              </p>
              <p className="text-sm text-neutral-400">
                About to slip — opening her file…
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
