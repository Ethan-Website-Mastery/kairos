import type { Client } from "@/lib/types";

const DAY_NAMES: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const dayFull = (d: string) => DAY_NAMES[d] ?? d;
const countWord = (n: number) =>
  n === 1 ? "once" : n === 2 ? "twice" : `${n} times`;

/**
 * The moat, made tangible: Kairos remembers THIS person's pattern. Built
 * entirely from seeded history (pastSlips, pastSlipDays, leversThatWorked) —
 * no per-client hardcoding.
 */
export default function PatternMemory({ client }: { client: Client }) {
  const { history } = client.signals;
  const slips = history.pastSlips.length;
  if (slips === 0) return null;

  const firstName = client.name.split(" ")[0];
  const days = Array.from(new Set((history.pastSlipDays ?? []).map(dayFull)));

  let dayClause = "";
  if (days.length === 1) {
    dayClause =
      slips === 1
        ? `, on a ${days[0]}`
        : slips === 2
          ? `, both on ${days[0]}s`
          : `, usually on ${days[0]}s`;
  } else if (days.length > 1) {
    dayClause = `, on ${days.join(" and ")}`;
  }

  const lever = history.leversThatWorked[0];
  const recovered = lever
    ? ` ${lever} ${
        slips > 1
          ? `brought ${firstName} back each time`
          : `got ${firstName} back on track`
      }.`
    : "";

  const sentence = `Slipped ${countWord(slips)} before${dayClause}.${recovered}`;

  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
      <p className="flex items-center gap-1.5 text-eyebrow text-neutral-400">
        <span aria-hidden>◆</span>
        Kairos remembers {firstName}
      </p>
      <p className="mt-1 text-sm text-neutral-300">{sentence}</p>
    </div>
  );
}
