import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** When set, the header becomes a sort link (`?sort=<sortKey>&order=asc|desc`). */
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Path + current query params, used to build sort/page links without losing filters. */
  basePath: string;
  params?: Record<string, string | undefined>;
  total?: number;
  page?: number;
  size?: number;
  sort?: string;
  order?: "asc" | "desc";
  emptyTitle?: string;
  emptyDescription?: string;
  caption: string;
}

function href(base: string, params: Record<string, string | undefined>) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  return q.size ? `${base}?${q}` : base;
}

/** Server-rendered table: sorting and paging are plain links, so it works without JavaScript. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  basePath,
  params = {},
  total,
  page = 1,
  size = 20,
  sort,
  order = "desc",
  emptyTitle = "Nothing here yet",
  emptyDescription = "When there is something to show, it will appear here.",
  caption,
}: DataTableProps<T>) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="space-y-3">
      <div className="scroll-slim overflow-x-auto border-2 border-border bg-card">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => {
                const active = c.sortKey && sort === c.sortKey;
                const nextOrder = active && order === "desc" ? "asc" : "desc";
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}
                    className={`px-3 py-2 font-medium ${c.className ?? ""}`}
                  >
                    {c.sortKey ? (
                      <Link
                        href={href(basePath, {
                          ...params,
                          sort: c.sortKey,
                          order: nextOrder,
                          page: undefined,
                        })}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {c.header}
                        {active &&
                          (order === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden="true" />
                          ))}
                      </Link>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={rowKey(r)} className="hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2 align-top ${c.className ?? ""}`}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total !== undefined && (
        <Pagination
          page={page}
          size={size}
          total={total}
          hrefFor={(p) =>
            href(basePath, { ...params, sort, order: sort ? order : undefined, page: String(p) })
          }
        />
      )}
    </div>
  );
}
