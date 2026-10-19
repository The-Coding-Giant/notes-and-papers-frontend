import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PaperSummary } from "@/lib/api/types";
import { kindLabel, paperContext, paperHref } from "@/lib/routes";

/** A paper as a bordered row: icon tile, title, where it belongs, badges, and an arrow that nudges on hover. */
export function PaperCard({ paper }: { paper: PaperSummary }) {
  return (
    <Link href={paperHref(paper)} className="brutal brutal-hover group flex items-center gap-4 p-4">
      <span className="grid size-12 shrink-0 place-items-center border-2 border-border bg-primary">
        <FileText className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="line-clamp-2 block font-bold leading-snug">{paper.title}</span>
        <span className="eyebrow block truncate text-muted-foreground">{paperContext(paper)}</span>
        <span className="flex flex-wrap gap-1.5">
          {paper.year && <Badge tone="primary">{paper.year}</Badge>}
          {paper.kind !== "question_paper" && <Badge tone="accent">{kindLabel(paper.kind)}</Badge>}
          {paper.language && <Badge>{paper.language}</Badge>}
          {paper.paper_code && <Badge>Code {paper.paper_code}</Badge>}
        </span>
      </span>
      <ArrowRight
        className="hidden size-5 shrink-0 transition-transform group-hover:translate-x-1 sm:block"
        aria-hidden="true"
      />
    </Link>
  );
}
