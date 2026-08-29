"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

const NAV_SECTIONS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/food", label: "Food" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
] as const;

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight"
        >
          CalorieTrack <span className="text-emerald-600">NG</span>
        </Link>

        <nav
          aria-label="Main"
          className="flex flex-wrap items-center gap-1 text-sm font-medium"
        >
          {NAV_SECTIONS.map((section) => {
            const isActive =
              pathname === section.href ||
              pathname.startsWith(`${section.href}/`);

            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "rounded-md bg-emerald-600 px-3 py-1.5 text-white"
                    : "rounded-md px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }
              >
                {section.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/food/add?from=${encodeURIComponent(pathname)}`}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            + Add Food
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
