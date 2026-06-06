# Kairos

**Kairos predicts the moment someone is about to break a commitment to themselves — and intervenes at that exact moment with the right psychological lever.**

> *Kairos* (καιρός): the opportune, decisive moment. Not just *when* to act, but the *right* time to act.

---

## The problem

Silent client drop-off is the #1 churn driver for online coaches. People don't quit with a cancellation email — they go quiet, miss a session, then another, and by the time a coach notices, they're already gone. One human can't watch a full roster closely enough to catch every wobble in time. The signal is there (recovery dipping, sessions slipping, replies slowing); nobody is watching it at 6pm on a Thursday when it matters.

## How it works — the loop

Kairos runs a closed behavior-change loop, end to end:

1. **Predict** — a transparent risk model scores each client's chance of missing their weekly goal in the next window.
2. **Explain** — the score breaks down into **named drivers** ("Recovery down 41%", "Gone quiet — 6 days", "Behind pace: 1 of 4"), so the coach trusts it.
3. **Choose a lever** — an LLM (the JITAI engine) reads the client's full state, the risk drivers, and what's worked for *this* person before, then picks the **single best behavioral lever** from a library of nine (cue trigger, habit stacking, loss aversion, identity framing, friction engineering, …) and explains *why*.
4. **Deliver** — it crafts the nudge — short, human, on the right channel, at the right time — and shows it as the client would receive it.
5. **Measure & learn** — when the client follows through, risk recomputes and visibly drops, and the lever that worked is logged and weighted up for next time. The loop closes and compounds.

The whole story renders on one page per client: **State → Why → Intervention → Loop.**

## Why now

JITAI — Just-In-Time Adaptive Intervention — has strong academic backing but stayed stuck in research labs. The reason: every study had to **hand-build decision rules per behavior** ("if step count < X and time = evening and weather = clear, then prompt"). That doesn't scale past a single study and a single habit. An LLM now does the per-person *"which lever, for whom, delivered how and when"* reasoning directly — cheaply, in one call, generalizing across people and behaviors. The hard part of JITAI just became a prompt.

## What's real vs. illustrative

Being honest about the seams:

| | |
|---|---|
| **Real** | The LLM lever selection + reasoning (one Sonnet call per intervention, grounded in the client's actual signals and history). The explainable, rule-based risk model. The closed loop — risk genuinely recomputes from the same model after follow-through. |
| **Illustrative** | The client signal data is seeded (no wearable/calendar integrations yet). The client's "response" is simulated on a button click rather than observed in the wild. |

Nothing about the reasoning or the scoring is faked — feed real signals in and the same machinery runs. What's stubbed is the data pipes at either end.

## Stack

- **Next.js** (App Router, TypeScript, Tailwind) — single app, no separate backend
- **Anthropic** Claude **Sonnet**, called server-side for lever selection (one call per generate, no streaming)
- **Vercel** for deploy

The risk model and the loop are pure, client-safe functions, so the loop runs in React state — instant, and resilient to a flaky connection during a live demo.

### Run locally

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Without a key, intervention generation falls back to a hand-written nudge so the demo always renders.

---

**Live demo:** _<placeholder — Vercel URL>_

**Team:** Ethan & David — ethan@visionary-one.com
