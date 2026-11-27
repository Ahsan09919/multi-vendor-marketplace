"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export default function DashboardNav({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      <nav className="mt-2 flex gap-1 overflow-x-auto lg:flex-col">
        {items.map((item) => {
          const active =
            item.href === pathname ||
            (item.href !== "/vendor" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
