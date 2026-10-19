import type { PaperSummary } from "@/lib/api/types";
import { PaperCard } from "./paper-card";

export function PaperList({ papers }: { papers: PaperSummary[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {papers.map((p) => (
        <li key={p.slug}>
          <PaperCard paper={p} />
        </li>
      ))}
    </ul>
  );
}

export function PaperListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="h-[104px] animate-pulse border-2 border-border/30 bg-muted" />
      ))}
    </ul>
  );
}
