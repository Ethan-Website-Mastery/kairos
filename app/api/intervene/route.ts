import { NextResponse } from "next/server";
import { getClient } from "@/lib/data";
import { computeRisk } from "@/lib/risk";
import { callClaude } from "@/lib/anthropic";
import {
  LEVERS,
  getLever,
  FALLBACKS,
  genericFallback,
} from "@/lib/interventions";
import type { Client } from "@/lib/types";
import type { RiskResult } from "@/lib/risk";
import type { Intervention } from "@/lib/types";

/** Survives across requests in a warm lambda — repeat clicks are instant. */
const cache = new Map<string, Intervention>();

const SYSTEM = `You are Kairos, a Just-In-Time Adaptive Intervention (JITAI) engine for behavior change. A person is at risk of missing their weekly training goal. Given their current state, the drivers of that risk, and which levers have worked for them before, choose the SINGLE best behavioral lever from the provided library and craft the intervention to fire right now.
Rules:
- Choose exactly one lever, by its id, from the library.
- Prefer a lever that has worked for this person before; avoid any that previously failed.
- Ground your reasoning in this person's ACTUAL signals and history — name the specific facts (e.g. "recovery down 41%", "6 days quiet").
- Diagnosing the failure TYPE is the core of your job: decide whether the risk is logistical, motivational, physiological, or accountability-driven, then pick the lever that matches THAT type — and name one lever you deliberately rejected and why it's wrong for this person. Also identify the specific upcoming moment they're most likely to slip, grounded in their actual signals (calendar, quiet streak, recovery), and time the nudge to land just before it. Never invent a moment the signals don't support.
- Match tone and timing to their state: low recovery + gone quiet calls for warm and low-pressure, never guilt.
- The message must be short (1-2 sentences), human, and sendable to the client exactly as written.
- Output ONLY valid JSON. No markdown, no code fences, no commentary.`;

function buildUserMessage(client: Client, risk: RiskResult): string {
  const s = client.signals;
  const drivers = risk.drivers
    .map((d) => `  - ${d.label}: ${d.detail}`)
    .join("\n");
  const levers = LEVERS.map(
    (l) => `  - ${l.id} | ${l.name} | ${l.summary} | works ${l.whenItWorks}`,
  ).join("\n");

  return `CLIENT: ${client.name}
Weekly goal: ${client.weeklyGoal}

CURRENT SIGNALS:
  - Sleep: ${s.sleepHrs}h/night
  - HRV: ${s.hrv}ms
  - Recovery: ${s.recoveryPct}%
  - Sessions logged this week: ${s.sessionsLogged} of ${s.weeklyGoal}
  - Days since last check-in: ${s.daysSinceCheckIn}
  - Calendar load: ${s.calendarLoad}
  - Nudge response latency: ${s.nudgeResponseLatencyHrs}h

RISK: score ${risk.score}/100 (${risk.level})
TOP DRIVERS:
${drivers || "  - (none firing)"}

HISTORY:
  Past slips: ${s.history.pastSlips.length ? s.history.pastSlips.join("; ") : "none recorded"}
  Levers that worked before: ${s.history.leversThatWorked.length ? s.history.leversThatWorked.join("; ") : "none recorded"}

LEVER LIBRARY (choose exactly one by id):
${levers}

Respond with JSON only in this exact shape:
{
  "leverId": "<one library id>",
  "reasoning": "<2-3 sentences grounded in this person's specific signals + history>",
  "message": "<the nudge the client receives, 1-2 sentences>",
  "channel": "<push notification | WhatsApp | in-app>",
  "timing": "<e.g. Today 6:30pm, before her usual gym window>",
  "tone": "<e.g. warm, low-pressure>",
  "rejected": { "leverName": "<a plausible lever Kairos deliberately did NOT pick>", "why": "<one line: why it's wrong for THIS person's failure type>" },
  "predictedMoment": "<specific upcoming moment of vulnerability, grounded in a real driver — e.g. 'her next planned session, calendar packed with no clear gym window'>"
}`;
}

/** Strip code fences / surrounding prose, then JSON.parse defensively. */
function parseModelJson(raw: string): Record<string, unknown> | null {
  try {
    let text = raw.trim();
    // Drop ```json ... ``` or ``` ... ``` fences.
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    // Fall back to the first {...} block if there's stray prose.
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      text = text.slice(start, end + 1);
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function fallbackFor(clientId: string): Intervention {
  return FALLBACKS[clientId] ?? genericFallback(clientId);
}

export async function POST(req: Request) {
  let clientId = "";
  try {
    const body = await req.json();
    clientId = typeof body?.clientId === "string" ? body.clientId : "";
  } catch {
    // ignore — handled below
  }

  // Don't trust the browser for state: resolve everything server-side.
  const client = clientId ? getClient(clientId) : undefined;
  if (!client) {
    return NextResponse.json(fallbackFor(clientId));
  }

  const cached = cache.get(clientId);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const risk = computeRisk(client.signals, client.signals.history);
    const raw = await callClaude(SYSTEM, buildUserMessage(client, risk));
    const parsed = parseModelJson(raw);

    const leverId = parsed && typeof parsed.leverId === "string" ? parsed.leverId : "";
    const lever = getLever(leverId);
    const message = parsed && typeof parsed.message === "string" ? parsed.message : "";

    // Invalid lever or empty nudge → fall back rather than render junk.
    if (!parsed || !lever || !message.trim()) {
      return NextResponse.json(fallbackFor(clientId));
    }

    // Non-critical fields — parse defensively, never trigger a fallback.
    const rawRejected =
      parsed.rejected && typeof parsed.rejected === "object"
        ? (parsed.rejected as Record<string, unknown>)
        : {};
    const rejected = {
      leverName:
        typeof rawRejected.leverName === "string" ? rawRejected.leverName : "",
      why: typeof rawRejected.why === "string" ? rawRejected.why : "",
    };

    const intervention: Intervention = {
      clientId,
      leverId: lever.id,
      // Canonical name from the library — never the model's leverName.
      leverName: lever.name,
      reasoning:
        typeof parsed.reasoning === "string" ? parsed.reasoning : "",
      message: message.trim(),
      channel:
        typeof parsed.channel === "string" ? parsed.channel : "push notification",
      timing: typeof parsed.timing === "string" ? parsed.timing : "",
      tone: typeof parsed.tone === "string" ? parsed.tone : "",
      rejected,
      predictedMoment:
        typeof parsed.predictedMoment === "string" ? parsed.predictedMoment : "",
    };

    // Only cache real results, so a transient failure never poisons the cache.
    cache.set(clientId, intervention);
    return NextResponse.json(intervention);
  } catch {
    // NEVER 500 — the demo must always render something.
    return NextResponse.json(fallbackFor(clientId));
  }
}
