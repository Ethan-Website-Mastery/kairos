"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  UsersIcon,
  BoltIcon,
  ChartIcon,
  GearIcon,
  HelpIcon,
  BellIcon,
  SearchIcon,
  LogoIcon,
} from "./icons";

type NavItem = {
  label: string;
  icon: (p: { className?: string }) => ReactNode;
  href?: string;
  match?: (path: string) => boolean;
};

const MENU: NavItem[] = [
  { label: "Dashboard", icon: GridIcon, href: "/", match: (p) => p === "/" },
  { label: "Clients", icon: UsersIcon, match: (p) => p.startsWith("/client") },
  { label: "Interventions", icon: BoltIcon },
  { label: "Insights", icon: ChartIcon },
];

const GENERAL: NavItem[] = [
  { label: "Settings", icon: GearIcon },
  { label: "Help", icon: HelpIcon },
];

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const inner = (
    <span
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-neutral-900 text-white"
          : item.href
            ? "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            : "text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-700"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {item.label}
    </span>
  );

  // Real links navigate; visual-only items never 404.
  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {inner}
      </Link>
    );
  }
  return <div className="cursor-default">{inner}</div>;
}

function Sidebar({ path }: { path: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-neutral-200/70 bg-white/70 px-4 py-5 backdrop-blur lg:flex">
      <Link href="/" className="mb-7 flex items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
          <LogoIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          Kairos
        </span>
      </Link>

      <p className="px-3 pb-2 text-eyebrow text-neutral-400">Menu</p>
      <nav className="flex flex-col gap-1">
        {MENU.map((item) => (
          <NavRow
            key={item.label}
            item={item}
            active={item.match?.(path) ?? false}
          />
        ))}
      </nav>

      <p className="px-3 pb-2 pt-6 text-eyebrow text-neutral-400">General</p>
      <nav className="flex flex-col gap-1">
        {GENERAL.map((item) => (
          <NavRow key={item.label} item={item} active={false} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-neutral-100/70 p-3 text-xs text-neutral-500">
        <p className="font-medium text-neutral-700">Proactive mode on</p>
        <p className="mt-0.5">Kairos is watching your roster.</p>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-neutral-200/70 bg-white/60 px-5 py-3 backdrop-blur lg:px-8">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-2">
        <SearchIcon className="h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search clients…"
          aria-label="Search clients"
          className="w-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:block">
          ⌘F
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white/80 py-1 pl-1 pr-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-xs font-semibold text-white">
            EM
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-neutral-900">Ethan Morkel</p>
            <p className="text-[11px] text-neutral-500">ethan@visionary-one.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar path={path} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
