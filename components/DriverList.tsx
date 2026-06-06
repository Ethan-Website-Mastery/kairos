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
    <ul className="flex flex-col gap-3">
      {drivers.map((driver) => (
        <li
          key={driver.label}
          className="flex items-center gap-4 rounded-xl border border-neutral-200/80 bg-white p-4"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold tabular-nums text-neutral-600">
            +{driver.weight}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">
              {driver.label}
            </p>
            <p className="text-sm text-neutral-500">{driver.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
