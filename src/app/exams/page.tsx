import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { getExams } from "@/lib/api/public";
import type { ExamSummary } from "@/lib/api/types";
import { routes, yearRange } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { plural } from "@/lib/utils";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Exam Question Papers: UPSC, SSC, NEET, GATE, UGC NET",
  description:
    "Previous year question papers for competitive exams and school boards: UPSC, SSC, GATE, NEET, UGC NET, state PSCs and more.",
  path: "/exams",
});

function Group({ id, title, items }: { id: string; title: string; items: ExamSummary[] }) {
  if (items.length === 0) return null;
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e) => (
          <li key={e.slug}>
            <Link
              href={routes.exam(e.slug)}
              className="brutal brutal-hover flex h-full flex-col justify-between gap-5 p-5"
            >
              <span className="line-clamp-3 font-display text-2xl uppercase leading-snug">
                {e.name}
              </span>
              <span className="eyebrow flex items-center justify-between border-t-2 border-border pt-3 text-muted-foreground">
                <span>{plural(e.paper_count, "paper")}</span>
                {e.year_min && <span>{yearRange(e.year_min, e.year_max)}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ExamsPage() {
  const all = await getExams().catch(() => null);
  if (!all) {
    return (
      <EmptyState
        title="Exams are temporarily unavailable"
        description="Please try again in a few minutes."
        action={{ href: "/", label: "Go to home" }}
      />
    );
  }
  const withPapers = all.filter((e) => e.paper_count > 0);
  const exams = withPapers.filter((e) => e.kind === "exam");
  const boards = withPapers.filter((e) => e.kind === "board");

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Exams", path: routes.exams },
        ]}
      />
      <header className="space-y-2">
        <h1 className="text-5xl sm:text-6xl">Exam question papers</h1>
        <p className="max-w-3xl text-muted-foreground">
          {plural(
            withPapers.reduce((n, e) => n + e.paper_count, 0),
            "paper",
          )}{" "}
          across {plural(withPapers.length, "exam and board")}. Pick an exam to see its papers year
          by year.
        </p>
      </header>
      <Group id="competitive-exams" title="Competitive exams" items={exams} />
      <Group id="school-boards" title="School boards" items={boards} />
    </div>
  );
}
