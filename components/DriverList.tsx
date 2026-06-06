import type { Driver } from "@/lib/risk";

export default function DriverList({ drivers }: { drivers: Driver[] }) {
  if (drivers.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Nothing pulling this client off track right now.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5">
      {drivers.map((driver) => (
        <li key={driver.label} className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex h-6 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold tabular-nums text-neutral-300">
            +{driver.weight}
          </span>
          <p className="min-w-0 truncate text-sm text-neutral-300">
            <span className="font-medium text-neutral-100">{driver.label}</span>
            <span className="text-neutral-500"> — {driver.detail}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
