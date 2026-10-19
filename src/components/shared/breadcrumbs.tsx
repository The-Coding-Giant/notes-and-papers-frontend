import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLdScript } from "./json-ld";
import { breadcrumbLd } from "@/lib/seo";

export interface Crumb {
  name: string;
  path: string;
}

/** Visible breadcrumb trail + BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto">
        <ol className="inline-flex min-w-0 items-center gap-1 border-2 border-border bg-card px-3 py-2 text-xs font-bold uppercase tracking-wide shadow-hard-sm">
          {items.map((it, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${it.path}-${i}`} className="flex min-w-0 items-center gap-1">
                {last ? (
                  <span
                    aria-current="page"
                    className="max-w-[40ch] truncate bg-primary px-1.5 py-0.5"
                  >
                    {it.name}
                  </span>
                ) : (
                  <Link
                    href={it.path}
                    className="flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {i === 0 && <Home className="size-3.5" aria-hidden="true" />}
                    {i === 0 ? <span className="sr-only">{it.name}</span> : it.name}
                  </Link>
                )}
                {!last && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLdScript data={breadcrumbLd(items)} />
    </>
  );
}
