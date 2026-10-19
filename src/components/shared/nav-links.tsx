"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Desktop navigation with the current section highlighted. */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {items.map((n) => {
        const active = path === n.href || path.startsWith(`${n.href}/`);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
              active
                ? "border-border bg-primary text-primary-foreground shadow-hard-sm"
                : "border-transparent hover:border-border hover:bg-muted",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
