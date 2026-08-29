"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_SECTIONS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/foods", label: "Foods" },
  { href: "/admin/users", label: "Users" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 border-b border-neutral-200 pb-3 dark:border-neutral-800"
    >
      {ADMIN_SECTIONS.map((section) => {
        const isActive = pathname === section.href;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
