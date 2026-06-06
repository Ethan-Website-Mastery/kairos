# Kairos

**Predicts the moment someone is about to break a commitment to themselves — and intervenes at that exact moment with the right psychological lever.**

🔗 **Live demo:** https://kairos-git-live-mode-ethans-projects-273fecd4.vercel.app/

## The problem
Online coaches lose more clients to silent drop-off than to anything else. One coach can't watch 100 clients for the exact moment each is about to quit — so people drift, go quiet, and cancel before the coach ever notices.

## How it works — the loop
Kairos runs a closed loop on every client, continuously:
1. **Predict** — a transparent risk score flags who's about to slip, and why (named drivers, no black box).
2. **Diagnose** — it works out the *failure type*: logistical, motivational, physiological, accountability.
3. **Choose** — it picks the single behavioral lever (from a 9-lever JITAI library) that fits *this* person in *this* state, and names the one it deliberately rejected.
4. **Time** — it fires the nudge at the predicted moment of vulnerability, drawn from the client's real calendar and slip history.
5. **Deliver** — the coach approves; the client gets it.
6. **Learn** — each outcome updates the per-client track record, so the engine gets better at *this* person every cycle.

## Why it's different
Every churn tool stops at diagnosis: a risk score with named drivers. That's commodity. Kairos does the part none of them do — decide *which* psychological lever will work on *this* person, *right now*, fire it at the right moment, and learn from whether it worked. They built a filing cabinet; we built an early-warning system with a hand on the lever.

## Why now
JITAI (Just-In-Time Adaptive Interventions) is an established behavioral-science field, but it stayed locked in academia: every study hand-built its decision rules per behavior with a research team, so it couldn't generalize or scale. LLMs collapse that cost — the "which lever, for whom, at what moment" reasoning now runs per person, cheaply, over messy signals. That's the unlock.

## What's real vs. illustrative
Built in a day, so we're explicit about the line:
- **Real:** the LLM lever selection + reasoning + rejected-lever discrimination (live Claude calls); the transparent, explainable risk model; the closed-loop logic; the per-client track record derived from each client's history.
- **Illustrative:** the client roster + signals are seeded; the client's follow-through is simulated; the live activity feed is dramatized from real roster state. Whether a lever actually changes behavior is what the loop is *built to measure* — the first thing we'd validate with design-partner coaches.

## Roadmap
Today Kairos runs on the data coaches already have (sessions, recovery, check-ins, calendar). Next: live wearable sync (Whoop/Garmin/Oura), weather, location. And the engine is behavior-agnostic — a loop that learns which intervention moves a real person at the right moment isn't really about fitness. It extends to any high-stakes adherence problem: medication, chronic care, recovery. Coaching is how we get in.

## Stack
Next.js (App Router, TypeScript) · Tailwind · server-side Anthropic Claude (Sonnet) for the intervention engine · Vercel. No database — seeded/in-memory for the demo.

## Team
Built at the AI BEAVERS founder hackathon, Hamburg, June 6 2026 — by Ethan Morkel & David Britz. Contact: ethan@visionary-one.com.
