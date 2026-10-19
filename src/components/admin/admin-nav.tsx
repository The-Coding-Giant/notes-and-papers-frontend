"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Flag,
  Gauge,
  History,
  Inbox,
  Radio,
  Search,
  Upload,
  Settings,
  Users,
  Globe,
} from "lucide-react";
import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: Gauge, admin: true },
  { href: "/admin/review", label: "Review queue", icon: ClipboardCheck },
  { href: "/admin/papers", label: "Papers", icon: FileText },
  { href: "/admin/notes", label: "Notes", icon: Inbox },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/sources", label: "Sources", icon: Globe, admin: true },
  { href: "/admin/runs", label: "Crawl runs", icon: History, admin: true },
  { href: "/admin/content", label: "Content", icon: Database, admin: true },
  { href: "/admin/seo", label: "SEO", icon: BarChart3, admin: true },
  { href: "/admin/analytics", label: "Analytics", icon: Radio, admin: true },
  { href: "/admin/imports", label: "Data imports", icon: Upload, admin: true },
  { href: "/admin/insights", label: "Search insights", icon: Search, admin: true },
  { href: "/admin/users", label: "Users", icon: Users, admin: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, admin: true },
  { href: "/admin/audit", label: "Audit log", icon: History, admin: true },
];

export function AdminNav({ role }: { role: Role }) {
  const path = usePathname();
  const items = ITEMS.filter((i) => !i.admin || role === "admin");
  return (
    <nav
      aria-label="Admin"
      className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 border-2 border-transparent px-3 py-2 text-xs font-bold uppercase tracking-wide hover:border-border hover:bg-muted",
              active && "border-border bg-primary text-primary-foreground shadow-hard-sm",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
