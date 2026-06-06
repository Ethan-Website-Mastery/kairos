"use client";

import { useState } from "react";
import type { Intervention } from "@/lib/types";
import InterventionCard from "./InterventionCard";

export default function InterventionPanel({ clientId }: { clientId: string }) {
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/intervene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      // Route never 500s — it always returns a renderable intervention.
      setIntervention(await res.json());
    } catch {
      // Network died entirely; leave the button available to retry.
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white p-6 text-sm text-neutral-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
        Kairos is choosing the right lever…
      </div>
    );
  }

  if (intervention) {
    return (
      <div className="flex flex-col gap-3">
        <InterventionCard intervention={intervention} />
        <button
          onClick={generate}
          className="self-start text-xs text-neutral-400 transition-colors hover:text-neutral-900"
        >
          Regenerate
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={generate}
      className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
    >
      Generate intervention
    </button>
  );
}
